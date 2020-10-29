import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


class FirebaseApp(object):
  @classmethod
  def admin(cls, project_id):
    admin_app_name = f"{project_id}-admin"
    try:
      cred = credentials.ApplicationDefault()
      return firebase_admin.initialize_app(
          cred,
          {
              "projectId": project_id,
          },
          name=admin_app_name,
      )
    except ValueError:
      return firebase_admin.get_app(admin_app_name)
