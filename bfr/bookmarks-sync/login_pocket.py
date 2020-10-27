from pocket import Pocket
import logging
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import time
from threading import Thread
import cgi


class Handler(BaseHTTPRequestHandler):
    logger = logging.getLogger("Handler")

    def do_GET(self):
        self.logger.debug(
            f"got redirect; path={self.path}, " +
            f"content_type={self.headers.get_content_type()}")

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(
            "<html><body><p>You are now logged in.</p></body></html>".encode())

        # Has to happen on a separate thread, else deadlock.
        def shutdown():
            time.sleep(5)
            self.server.shutdown()

        t = Thread(target=shutdown)
        t.start()


class OAuthRedirectServer(object):
    logger = logging.getLogger("OAuthRedirectServer")

    def wait_for_redirect(self):
        self.server = HTTPServer(('', 8000), Handler)
        self.logger.debug("Waiting for redirect...")
        self.server.serve_forever()
        self.logger.debug("Done")


def main():
    default_consumer_key = "93907-4bc0f7edcc3af162423e8b53"
    parser = argparse.ArgumentParser()
    parser.add_argument("--log-level", type=str, default="INFO")
    parser.add_argument("--access-token", type=str, required=False)
    parser.add_argument("--consumer-key", type=str,
                        required=False, default=default_consumer_key)
    parser.add_argument("--login",
                        action="store_true", required=False)
    args = parser.parse_args()
    logging.basicConfig(level=args.log_level)
    logger = logging.getLogger("fetch")
    logger.debug("Starting...")

    if (not args.access_token and not args.login):
        raise Exception(
            "Either pass in your access token or specify --login to log in again")

    access_token = args.access_token
    consumer_key = args.consumer_key

    if (args.login):
        server = OAuthRedirectServer()
        logger.debug(
            "Login requested, logging in with consumer_key=" + consumer_key)
        request_token = Pocket.get_request_token(
            consumer_key=consumer_key, redirect_uri="http://localhost:8000/")
        logger.debug(f"Got rt {request_token}")
        auth_url = Pocket.get_auth_url(
            code=request_token, redirect_uri="http://localhost:8000/")
        logger.debug(f"Got auth url {auth_url}")
        server.wait_for_redirect()

        user_credentials = Pocket.get_credentials(
            consumer_key=consumer_key, code=request_token)
        logger.debug("Got creds " + str(user_credentials))
        access_token = user_credentials['access_token']

    logger.debug(
        f"Logged in; access_token={access_token}, consumer_key={consumer_key}")


main()
