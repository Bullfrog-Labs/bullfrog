import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


class FirebaseApp(object):
    @classmethod
    def admin(cls, project_id):
        cred = credentials.ApplicationDefault()
        app = firebase_admin.initialize_app(
            cred,
            {
                "projectId": project_id,
            },
        )
        return app