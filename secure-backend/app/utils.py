from passlib.context import CryptContext
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
)
from webauthn.helpers import base64url_to_bytes 
from webauthn.helpers.structs import (
    AttestationConveyancePreference,
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    PublicKeyCredentialDescriptor, # <--- Added this import
)

# --- 1. Password Logic ---
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- 2. WebAuthn Configuration ---
RP_ID = "localhost" 
RP_NAME = "Secure Attendance"
ORIGIN = "http://localhost:3000" 

# --- 3. WebAuthn Functions ---
def generate_bind_options(user):
    return generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_id=str(user.id).encode(),
        user_name=user.username,
        attestation=AttestationConveyancePreference.DIRECT,
        authenticator_selection=AuthenticatorSelectionCriteria(
            user_verification=UserVerificationRequirement.REQUIRED,
        ),
    )

def verify_bind_response(credential_json, challenge_in_db):
    expected_challenge_bytes = base64url_to_bytes(challenge_in_db)
    
    return verify_registration_response(
        credential=credential_json,
        expected_challenge=expected_challenge_bytes,
        expected_origin=ORIGIN,
        expected_rp_id=RP_ID,
        require_user_verification=True,
    )

def generate_login_options(existing_credential_ids):
    # FIX IS HERE: We convert raw bytes into specific Descriptor objects
    allow_credentials = []
    for cred_id in existing_credential_ids:
        allow_credentials.append(
            PublicKeyCredentialDescriptor(id=cred_id)
        )

    return generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=allow_credentials, # Pass the objects, not raw bytes
        user_verification=UserVerificationRequirement.REQUIRED,
    )

def verify_login_response(credential_json, challenge_in_db, public_key, sign_count):
    expected_challenge_bytes = base64url_to_bytes(challenge_in_db)

    return verify_authentication_response(
        credential=credential_json,
        expected_challenge=expected_challenge_bytes,
        expected_origin=ORIGIN,
        expected_rp_id=RP_ID,
        credential_public_key=public_key,
        credential_current_sign_count=sign_count,
        require_user_verification=True,
    )