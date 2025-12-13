// src/utils/webauthn.ts

export const bufferDecode = (value: string): ArrayBuffer => {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}

export const bufferEncode = (value: ArrayBuffer): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(value))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function createCredential(options: any) {
  // Decode challenge and user ID
  options.challenge = bufferDecode(options.challenge);
  options.user.id = bufferDecode(options.user.id);

  const credential: any = await navigator.credentials.create({ publicKey: options });

  // Encode response for server
  return {
    id: credential.id,
    rawId: bufferEncode(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferEncode(credential.response.attestationObject),
      clientDataJSON: bufferEncode(credential.response.clientDataJSON),
    }
  };
}

export async function getCredential(options: any) {
  options.challenge = bufferDecode(options.challenge);
  options.allowCredentials.forEach((cred: any) => {
    cred.id = bufferDecode(cred.id);
  });

  const assertion: any = await navigator.credentials.get({ publicKey: options });

  return {
    id: assertion.id,
    rawId: bufferEncode(assertion.rawId),
    type: assertion.type,
    response: {
      authenticatorData: bufferEncode(assertion.response.authenticatorData),
      clientDataJSON: bufferEncode(assertion.response.clientDataJSON),
      signature: bufferEncode(assertion.response.signature),
      userHandle: assertion.response.userHandle ? bufferEncode(assertion.response.userHandle) : null
    }
  };
}