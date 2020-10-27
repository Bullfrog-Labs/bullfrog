# Provider config
provider "google" {
  project = "optimum-habitat-293418"
  region  = "us-central1"
  zone    = "us-central1-c"
}

# Some 
resource "google_app_engine_application" "bookmarks_sync_app" {
  project       = "optimum-habitat-293418"
  location_id   = "us-central"
  database_type = "CLOUD_FIRESTORE"
}

# Service account for scheduler
resource "google_service_account" "default_service_account" {
  account_id   = "default-service-account"
  display_name = "Default Service Account"
}

# Create the storage bucket
resource "google_storage_bucket" "deploy_packages_bucket" {
  name = "deploy_packages"
}

# Zip up our source code
data "archive_file" "bookmark_sync_package" {
  type        = "zip"
  source_dir  = "${path.root}/../bookmarks-sync/"
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
  entry_point           = "main"
  trigger_http          = true
  runtime               = "python38"
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
  name     = "bookmarks-sync-scheduler"
  schedule = "* * * * *"

  http_target {
    uri = google_cloudfunctions_function.bookmarks_sync_function.https_trigger_url
    oidc_token {
      service_account_email = google_service_account.default_service_account.email
    }
  }
}
