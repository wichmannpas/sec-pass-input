(function () {
  const passwordInput = document.getElementById('password-input')
  const passwordData = window.createSecurePasswordInput(passwordInput)
  const saltInput = document.getElementById('salt-input')
  const saltData = window.createSecurePasswordInput(saltInput)

  const keyDisplay = document.getElementById('key-display')
  const saltDisplay = document.getElementById('salt-display')

  function bufferToBase64 (value) {
    let binary = '';
    let bytes = new Uint8Array(value);
    for (let i = 0; i < value.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  function byteArrayToString (array) {
    let result = ''
    for (let i = 0; i < array.byteLength; i++) {
      result += String.fromCharCode(array[i])
    }
    return result
  }

  const initialSalt = window.crypto.getRandomValues(new Uint8Array(16))
  saltData.setValue(initialSalt)

  async function deriveKey () {
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordData.value,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    passwordData.clear()

    let key = await window.crypto.subtle.deriveKey(
      {
        'name': 'PBKDF2',
        salt: saltData.value,
        'iterations': 100000,
        'hash': 'SHA-256'
      },
      passwordKey,
      {
        'name': 'AES-GCM',
        'length': 256
      },
      true,
      ['encrypt', 'decrypt']
    )
    keyDisplay.innerText = bufferToBase64(await window.crypto.subtle.exportKey('raw', key))
    saltDisplay.innerText = bufferToBase64(saltData.value)
  }

  passwordInput.onenter = deriveKey
  saltInput.onenter = deriveKey
  document.getElementById('derive').onclick = deriveKey
})();