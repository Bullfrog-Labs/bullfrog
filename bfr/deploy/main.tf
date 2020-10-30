# Provider config
provider "google" {
  project = "bullfrog-reader"
  region  = "us-central1"
  zone    = "us-central1-c"
}

resource "google_project_service" "gcp_services_cloudbuild" {
  project = "bullfrog-reader"
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "gcp_services_cloudscheduler" {
  project = "bullfrog-reader"
  service = "cloudscheduler.googleapis.com"
}

resource "google_project_service" "gcp_services_cloudfunctions" {
  project = "bullfrog-reader"
  service = "cloudfunctions.googleapis.com"
}

# Some 
resource "google_app_engine_application" "bookmarks_sync_app" {
  project       = "bullfrog-reader"
  location_id   = "us-central"
  database_type = "CLOUD_FIRESTORE"
  depends_on    = [google_project_service.gcp_services_cloudbuild]
}

# Service account for scheduler
resource "google_service_account" "default_service_account" {
  account_id   = "default-service-account"
  display_name = "Default Service Account"
}

resource "google_project_iam_member" "dsa_datastore_owner" {
  project = "bullfrog-reader"
  role    = "roles/datastore.owner"
  member  = "serviceAccount:${google_service_account.default_service_account.email}"
}

# Create the storage bucket
resource "google_storage_bucket" "deploy_packages_bucket" {
  name = "deploy_packages"
}

# Zip up our source code
data "archive_file" "bookmark_sync_package" {
  type        = "zip"
  source_dir  = "${path.root}/../bookmarks-sync/src/bookmarks_sync/"
  output_path = "${path.root}/../dist/bookmarks-sync-package.zip"
}

# Place the zip-ed code in the bucket
resource "google_storage_bucket_object" "bookmarks_sync_package_object" {
  name   = "bookmarks-sync-package-${data.archive_file.bookmark_sync_package.output_md5}.zip"
  bucket = google_storage_bucket.deploy_packages_bucket.name
  source = "${path.root}/../dist/bookmarks-sync-package.zip"
}

resource "google_cloudfunctions_function" "bookmarks_sync_function" {
  name                  = "bookmarks-sync"
  description           = "Sync bookmarks from external app"
  available_memory_mb   = 256
  timeout               = 60
  source_archive_bucket = google_storage_bucket.deploy_packages_bucket.name
  source_archive_object = google_storage_bucket_object.bookmarks_sync_package_object.name
  service_account_email = google_service_account.default_service_account.email
  entry_point           = "main"
  trigger_http          = true
  runtime               = "python38"
  depends_on            = [google_project_service.gcp_services_cloudfunctions]
  environment_variables = {
    ACCESS_TOKEN = "a0af4686-b342-6348-386c-719575"
    CONSUMER_KEY = "93907-4bc0f7edcc3af162423e8b53"
  }
}

# Scheduler

resource "google_cloudfunctions_function_iam_member" "scheduler_function_iam_member" {
  project        = google_cloudfunctions_function.bookmarks_sync_function.project
  region         = google_cloudfunctions_function.bookmarks_sync_function.region
  cloud_function = google_cloudfunctions_function.bookmarks_sync_function.name

  role   = "roles/cloudfunctions.invoker"
  member = "serviceAccount:${google_service_account.default_service_account.email}"
}

resource "google_cloud_scheduler_job" "bookmarks_sync_scheduler_job" {
  name       = "bookmarks-sync-scheduler"
  schedule   = "* * * * *"
  depends_on = [google_project_service.gcp_services_cloudscheduler]

  http_target {
    uri = google_cloudfunctions_function.bookmarks_sync_function.https_trigger_url
    oidc_token {
      service_account_email = google_service_account.default_service_account.email
    }
  }
}
