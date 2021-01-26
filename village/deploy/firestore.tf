resource "null_resource" "enable_firestore" {
  provisioner "local-exec" {
    command = "make firestore"
  }

  depends_on = [google_firebase_project_location.default]
}

#resource "google_firestore_index" "trainings_user_time" {
#  depends_on = [null_resource.enable_firestore]
#}
