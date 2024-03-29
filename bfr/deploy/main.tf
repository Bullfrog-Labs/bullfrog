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
resource "google_app_engine_application" "bfr_app" {
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

data "local_file" "ingest_gcf_package" {
  filename = "${path.root}/../ingest-gcf/dist/ingest-gcf-package.zip"
}

# ingest-gcf-package.zip is built by running bin/build
# Place the ingest_gcf code package in the bucket
resource "google_storage_bucket_object" "ingest_gcf_package_object" {
  name   = "ingest-gcf-package-${filemd5(data.local_file.ingest_gcf_package.filename)}.zip"
  bucket = google_storage_bucket.deploy_packages_bucket.name
  source = data.local_file.ingest_gcf_package.filename
}

resource "google_cloudfunctions_function" "bookmarks_sync_function" {
  name                  = "sync_pocket_for_all_users"
  description           = "Sync bookmarks from Pocket"
  available_memory_mb   = 1024
  timeout               = 60
  source_archive_bucket = google_storage_bucket.deploy_packages_bucket.name
  source_archive_object = google_storage_bucket_object.ingest_gcf_package_object.name
  service_account_email = google_service_account.default_service_account.email
  entry_point           = "sync_pocket_for_all_users"
  trigger_http          = true
  runtime               = "python38"
  depends_on            = [google_project_service.gcp_services_cloudfunctions]
  environment_variables = {
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
  schedule   = "*/5 * * * *"
  depends_on = [google_project_service.gcp_services_cloudscheduler]

  http_target {
    uri = google_cloudfunctions_function.bookmarks_sync_function.https_trigger_url
    oidc_token {
      service_account_email = google_service_account.default_service_account.email
    }
  }
}
