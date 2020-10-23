# Provider config
provider "google" {
  project = "optimum-habitat-293418"
  region  = "us-central1"
  zone    = "us-central1-c"
}

# Create the storage bucket
resource "google_storage_bucket" "deploy_packages_bucket" {
 name   = "deploy_packages"
}

# Zip up our source code
data "archive_file" "bookmark_sync_package" {
 type        = "zip"
 source_dir  = "${path.root}/../bookmarks-sync/"
 output_path = "${path.root}/../dist/bookmarks-sync-package.zip"
}

# Place the zip-ed code in the bucket
resource "google_storage_bucket_object" "bookmarks_sync_package_object" {
 name   = "bookmarks-sync-package.zip"
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
 runtime               = "python37"
}

# Create scheduler
resource "google_cloud_scheduler_job" "bookmarks_sync_scheduler_job" {
 name        = "bookmarks-sync-scheduler"
 schedule    = "* * * * *"

 http_target {
   uri = google_cloudfunctions_function.bookmarks_sync_function.https_trigger_url
 }
}