locals {
  cloud_build_member = "serviceAccount:${google_project.project.number}@cloudbuild.gserviceaccount.com"
}

resource "google_project_iam_member" "firebase_admin" {
  role   = "roles/firebase.admin"
  member = local.cloud_build_member

  depends_on = [google_project_service.cloud_build]
}

resource "google_project_iam_member" "api_keys_admin" {
  role   = "roles/serviceusage.apiKeysViewer"
  member = local.cloud_build_member

  depends_on = [google_project_service.cloud_build]
}
