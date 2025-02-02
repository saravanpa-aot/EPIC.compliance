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
"""Exposes all of the schemas in the compliance_api."""
from .agency import AgencyCreateSchema, AgencySchema
from .case_file import CaseFileCreateSchema, CaseFileSchema
from .common import KeyValueSchema
from .complaint import ComplaintCreateSchema, ComplaintSchema, ComplaintSourceContactSchema
from .inspection import InspectionCreateSchema, InspectionSchema
from .project import ProjectSchema
from .staff_user import StaffUserCreateSchema, StaffUserSchema, StaffUserUpdateSchema
from .topic import TopicCreateSchema, TopicSchema
