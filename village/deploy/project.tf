locals {
  project_id   = "${var.project}-${var.env}"
  project_name = "Village - ${title(var.env)}"
}

provider "google" {
  project = local.project_id
  region  = var.region
}

data "google_billing_account" "account" {
  display_name = var.billing_account
}

data "google_organization" "org" {
  domain = "blfrg.xyz"
}

resource "google_project" "project" {
  name            = local.project_name
  project_id      = local.project_id
  billing_account = data.google_billing_account.account.id
  org_id          = data.google_organization.org.org_id
}

resource "google_project_iam_member" "owner" {
  role   = "roles/owner"
  member = "user:${var.user}"

  depends_on = [google_project.project]
}

resource "google_project_service" "compute" {
  service    = "compute.googleapis.com"
  depends_on = [google_project.project]
}

resource "google_project_service" "container_registry" {
  service                    = "containerregistry.googleapis.com"
  depends_on                 = [google_project.project]
  disable_dependent_services = true
}

resource "google_project_service" "cloud_run" {
  service    = "run.googleapis.com"
  depends_on = [google_project.project]
}

resource "google_project_service" "cloud_build" {
  service    = "cloudbuild.googleapis.com"
  depends_on = [google_project.project]
}

resource "google_project_service" "firebase" {
  service                    = "firebase.googleapis.com"
  depends_on                 = [google_project.project]
  disable_dependent_services = true
}

resource "google_project_service" "firestore" {
  service    = "firestore.googleapis.com"
  depends_on = [google_project.project]
}
