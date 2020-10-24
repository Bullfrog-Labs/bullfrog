from typing import Any, List
from pocket import Pocket
import logging
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import time
from threading import Thread
import cgi

consumer_key = "93907-4bc0f7edcc3af162423e8b53"


class OAuthRedirectServer(object):
    logger = logging.getLogger("OAuthRedirectServer")
    access_token = None
    server = None

    def wait_for_token(self):
        def set_token(access_token):
            self.access_token = access_token

        class Handler(BaseHTTPRequestHandler):
            logger = logging.getLogger("Handler")

            def do_GET(self):
                self.logger.debug("got post")

                self.logger.debug(self.headers.get_payload())
                # self.logger.debug(self.headers.get_all())
                self.logger.debug(self.headers.get_content_type())
                self.logger.debug(self.headers.get_params())
                self.logger.debug(self.path)
                self.logger.debug(self.requestline)

                set_token("foo")
                self.send_response(200)

                def shutdown():
                    time.sleep(5)
                    self.server.shutdown()

                t = Thread(target=shutdown)
                t.start()

            def do_POST(self):
                self.logger.debug("got post")

                self.logger.debug(self.headers)
                self.logger.debug(self.headers['content-type'])
                self.logger.debug(self.path)
                self.logger.debug(self.requestline)

                set_token("foo")

                def shutdown():
                    self.server.shutdown()

                t = Thread(target=shutdown)
                t.start()

        self.server = HTTPServer(('', 8000), Handler)
        self.logger.debug("serving...")
        self.server.serve_forever()

        return self.access_token


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--log-level", type=str, default="INFO")
    parser.add_argument("--access-token", type=str, required=False)
    parser.add_argument("--login",
                        action="store_true", required=False)
    args = parser.parse_args()
    logging.basicConfig(level=args.log_level)
    logger = logging.getLogger("fetch")
    logger.debug("Starting...")

    if (not args.access_token and not args.login):
        raise Exception(
            "Either pass in your access token or specify --login to log in again")

    if (args.login):
        server = OAuthRedirectServer()
        logger.debug("Waiting...")

        request_token = Pocket.get_request_token(
            consumer_key=consumer_key, redirect_uri="http://localhost:8000/")
        logger.debug(f"Got rt {request_token}")
        auth_url = Pocket.get_auth_url(
            code=request_token, redirect_uri="http://localhost:8000/")
        logger.debug(f"Got auth url {auth_url}")

        token = server.wait_for_token()

        logger.debug("Got token " + token)

        user_credentials = Pocket.get_credentials(
            consumer_key=consumer_key, code=request_token)

        logger.debug("Got creds " + str(user_credentials))

        # auth_url = Pocket.get_auth_url(
        #    code=request_token, redirect_uri=redirect_uri)


main()
