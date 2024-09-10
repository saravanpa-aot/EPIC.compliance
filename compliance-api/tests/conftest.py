# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Common setup and fixtures for the pytest suite used by this service."""
import os
from random import random
from faker import Faker
import pytest
from flask_migrate import Migrate, upgrade
from sqlalchemy import event, text
from compliance_api.config import get_named_config
from compliance_api import create_app
from compliance_api.auth import jwt as _jwt
from compliance_api.models import db as _db
from .utilities.factory_utils import factory_auth_header

fake = Faker()
CONFIG = get_named_config("testing")


@pytest.fixture(scope="session")
def app():
    """Return a session-wide application configured in TEST mode."""
    print("app is getting created")
    os.environ["FLASK_ENV"] = "testing"
    _app = create_app(run_mode="testing")

    return _app


@pytest.fixture(scope="function")
def app_request():
    """Return a session-wide application configured in TEST mode."""
    os.environ["FLASK_ENV"] = "testing"
    _app = create_app(run_mode="testing")

    return _app


@pytest.fixture(scope="session")
def client(app):  # pylint: disable=redefined-outer-name
    """Return a session-wide Flask test client."""
    return app.test_client()


@pytest.fixture(scope="session")
def jwt():
    """Return a session-wide jwt manager."""
    return _jwt


@pytest.fixture(scope="session")
def client_ctx(app):  # pylint: disable=redefined-outer-name
    """Return session-wide Flask test client."""
    with app.test_client() as _client:
        yield _client


@pytest.fixture(scope="session")
def db(app):  # pylint: disable=redefined-outer-name, invalid-name
    """Return a session-wide initialised database.

    Drops schema, and recreate.
    """
    with app.app_context():
        drop_schema_sql = """DROP SCHEMA public CASCADE;
                             CREATE SCHEMA public;
                             GRANT ALL ON SCHEMA public TO postgres;
                             GRANT ALL ON SCHEMA public TO public;
                          """

        sess = _db.session()
        sess.execute(drop_schema_sql)
        sess.commit()

        # ############################################
        # There are 2 approaches, an empty database, or the same one that the app will use
        #     create the tables
        #     _db.create_all()
        # or
        # Use Alembic to load all of the DB revisions including supporting lookup data
        # This is the path we'll use in auth_api!!

        # even though this isn't referenced directly, it sets up the internal configs that upgrade needs
        Migrate(app, _db)
        upgrade()

        return _db


@pytest.fixture(scope="function")
def session(app, db):  # pylint: disable=redefined-outer-name, invalid-name
    """Return a function-scoped session."""
    with app.app_context():
        conn = db.engine.connect()
        txn = conn.begin()

        options = dict(bind=conn, binds={})
        sess = db.create_scoped_session(options=options)

        # establish  a SAVEPOINT just before beginning the test
        # (http://docs.sqlalchemy.org/en/latest/orm/session_transaction.html#using-savepoint)
        sess.begin_nested()

        @event.listens_for(sess(), "after_transaction_end")
        def restart_savepoint(sess2, trans):  # pylint: disable=unused-variable
            # Detecting whether this is indeed the nested transaction of the test
            if (
                trans.nested and not trans._parent.nested
            ):  # pylint: disable=protected-access
                # Handle where test DOESN'T session.commit(),
                sess2.expire_all()
                sess.begin_nested()

        db.session = sess

        sql = text("select 1")
        sess.execute(sql)

        yield sess

        # Cleanup
        sess.remove()
        # This instruction rollsback any commit that were executed in the tests.
        txn.rollback()
        conn.close()


@pytest.fixture(scope="function")
def client_id():
    """Return a unique client_id that can be used in tests."""
    _id = random.SystemRandom().getrandbits(0x58)
    #     _id = (base64.urlsafe_b64encode(uuid.uuid4().bytes)).replace('=', '')

    return f"client-{_id}"


@pytest.fixture(scope="session")
def docker_compose_files(pytestconfig):
    """Get the docker-compose.yml absolute path."""
    import os

    return [
        os.path.join(str(pytestconfig.rootdir), "tests/docker", "docker-compose.yml")
    ]


@pytest.fixture()
def auth_mock(monkeypatch):
    """Mock check_auth."""
    pass


@pytest.fixture()
def auth_header(client, jwt, request):
    """Create a basic admin header for tests."""
    staff_user = {
        "iss": "https://dev.loginproxy.gov.bc.ca/auth/",
        "aud": [
            "epictrack-web",
            "auth-web",
            "epic-compliance",
            "realm-management",
            "account",
        ],
        "sub": "56a72960-2fe2-4410-8c20-76a1580b7c68",
        "typ": "Bearer",
        "azp": "flask-jwt-oidc-test-client",
        "scope": "openid profile email",
        "name": "Dinesh Peickal Balakrishnan",
        "groups": [
            "realm-viewer",
            "realm-admin",
            "offline_access",
            "default-roles-eao-epic",
            "uma_authorization",
            "sysadmin",
        ],
        "preferred_username": "b16917cd4cba4df6acb9ff5ca4e56b28@idir",
        "given_name": "Dinesh",
        "family_name": "Peickal Balakrishnan",
        "email": "dinesh.peickalbalakrishnan@gov.bc.ca",
    }
    headers = factory_auth_header(jwt=jwt, claims=staff_user)
    return headers
