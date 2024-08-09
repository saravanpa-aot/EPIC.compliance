# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Staff User Schema."""
from marshmallow import EXCLUDE, Schema, fields
from marshmallow_enum import EnumField

from compliance_api.models.staff_user import PermissionEnum, StaffUser

from .base_schema import AutoSchemaBase
from .common import KeyValueSchema


class StaffUserSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Staff User schema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE
        model = StaffUser
        include_fk = True

    position = fields.Nested(KeyValueSchema, dump_only=True)
    full_name = fields.Method("get_full_name")

    def get_full_name(self, obj):  # pylint: disable=no-self-use
        """Derive fullname."""
        return f"{obj.first_name} {obj.last_name}"


class StaffUserCreateSchema(Schema):
    """User Request Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    position_id = fields.Int(
        metadata={
            "description": "The unique identifier of the position of the staff user."
        },
        required=True,
    )
    deputy_director_id = fields.Int(
        metadata={"description": "The unique identifier of the deputy director."}
    )
    supervisor_id = fields.Int(
        metadata={"description": "The unique identifier of the supervisor."}
    )
    auth_user_id = fields.Str(
        metadata={"description": "The unique identifier from the identity provider."},
        required=True,
    )
    permission = EnumField(
        PermissionEnum,
        metadata={"description": "The permission level of the staff user."},
        by_value=True,
        required=True,
    )
