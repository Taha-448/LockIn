import os
import base64
from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# 1. Load the 256-bit Key
load_dotenv()
KEY_B64 = os.getenv("ENCRYPTION_KEY")

if not KEY_B64:
    raise ValueError("No ENCRYPTION_KEY found in .env file!")

try:
    # Convert the Base64 string back to raw bytes
    KEY_BYTES = base64.urlsafe_b64decode(KEY_B64)
    
    # Verify Key Length for AES-256 (Must be 32 bytes)
    if len(KEY_BYTES) != 32:
        raise ValueError(f"Key is {len(KEY_BYTES)} bytes. AES-256 requires exactly 32 bytes.")
        
    # Initialize the AES-GCM Cipher engine
    aesgcm = AESGCM(KEY_BYTES)
    
except Exception as e:
    raise ValueError(f"Crypto Error: {str(e)}")

def encrypt_data(data: str) -> str:
    """
    Encrypts string using AES-256-GCM.
    Returns: Base64 string of (Nonce + Ciphertext + Tag)
    """
    if not data: return data
    
    # 1. Generate a unique 12-byte Nonce (Number used ONCE)
    # This ensures identical names (e.g. "John") look different every time.
    nonce = os.urandom(12)
    
    # 2. Encrypt (The library handles the Tag automatically in the output)
    ciphertext = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
    
    # 3. Combine Nonce + Ciphertext so we can decrypt later
    combined = nonce + ciphertext
    
    # 4. Return as string for Database
    return base64.urlsafe_b64encode(combined).decode('utf-8')

def decrypt_data(encrypted_str: str) -> str:
    """
    Decrypts AES-256-GCM string.
    """
    if not encrypted_str: return encrypted_str
    
    try:
        # 1. Decode string to bytes
        combined = base64.urlsafe_b64decode(encrypted_str)
        
        # 2. Extract the Nonce (First 12 bytes)
        nonce = combined[:12]
        
        # 3. Extract Ciphertext (The rest)
        ciphertext = combined[12:]
        
        # 4. Decrypt
        plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext_bytes.decode('utf-8')
        
    except Exception as e:
        # If decryption fails (wrong key or data tampering), this triggers
        print(f"Decryption Error: {e}")
        return "[ENCRYPTED_DATA_ERROR]"