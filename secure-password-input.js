// TODO: allow to provide a max length
// TODO: allow to disable dot display

(function () {
  const CONTROL_KEYS = [
    'Backspace', 'Delete',
    'ArrowLeft', 'ArrowRight',
    'Home', 'End',
  ]
  const ALLOWED_KEYS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',

    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

    'ä', 'Ä', 'ö', 'Ö', 'ü', 'Ü', 'ß',
    // TODO: more special characters

    ' ', '*', '/', '\\', '(', ')', '[', ']', '#', '@', '!', '.', ',', ';', ':', "'", '"', '%', '$', '~', '+', '-',
  ]
  const HANDLED_KEYS = CONTROL_KEYS + ALLOWED_KEYS

  function overwriteArray (array) {
    for (let i = 0; i < array.byteLength; i++) {
      array[i] = 0
    }
  }

  window.createSecurePasswordInput = (input) => {
    const passwordData = {
      value: new Uint8Array(0),
    }
    let cursorPosition = -1

    // make element focusable so we can listen to events
    input.tabIndex = 0

    input.classList.add('secure-password-input')

    function updateDotDisplay () {
      let display = ''
      if (cursorPosition === -1) {
        display += '<span class="cursor">l</span>'
      }
      for (let i = 0; i < passwordData.value.byteLength; i++) {
        display += '&bull;'
        if (cursorPosition === i) {
          display += '<span class="cursor">l</span>'
        }
      }
      input.innerHTML = display
    }

    updateDotDisplay()

    // listen to keys
    input.addEventListener('keydown', event => {
      if (HANDLED_KEYS.indexOf(event.key) === -1) {
        return
      }
      // ignore ctrl and alt keys, except if it is ctrl-arrow or ctrl-backspace
      if (
        (event.ctrlKey && !(event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          || event.key === 'Backspace' || event.key === 'Delete'))
        || event.altKey) {
        return
      }
      event.preventDefault()

      if (ALLOWED_KEYS.indexOf(event.key) >= 0) {
        // update value
        const newValue = new Uint8Array(passwordData.value.byteLength + 1)
        const beforeCursor = new Uint8Array(passwordData.value.buffer.slice(0, cursorPosition + 1))
        const afterCursor = new Uint8Array(passwordData.value.buffer.slice(cursorPosition + 1, passwordData.value.byteLength))
        newValue.set(beforeCursor)
        newValue.set(afterCursor, cursorPosition + 2)
        newValue[cursorPosition + 1] = event.key.charCodeAt(0)

        // overwrite old and temporary value with zeros
        overwriteArray(passwordData.value)
        overwriteArray(beforeCursor)
        overwriteArray(afterCursor)

        passwordData.value = newValue
        cursorPosition++
      } else if (event.key === 'Home' || (event.ctrlKey && event.key === 'ArrowLeft')) {
        cursorPosition = -1
      } else if (event.key === 'ArrowLeft') {
        if (cursorPosition < 0) {
          return
        }
        cursorPosition--
      } else if (event.key === 'End' || (event.ctrlKey && event.key === 'ArrowRight')) {
        cursorPosition = passwordData.value.byteLength - 1
      } else if (event.key === 'ArrowRight') {
        if (cursorPosition >= passwordData.value.byteLength - 1) {
          return
        }
        cursorPosition++
      } else if (event.key === 'Backspace') {
        if (cursorPosition < 0) {
          return
        }

        // update value
        let newLength = passwordData.value.byteLength - 1
        if (event.ctrlKey) {
          newLength = passwordData.value.byteLength - cursorPosition - 1
        }
        const newValue = new Uint8Array(newLength)
        const beforeCursor = new Uint8Array(passwordData.value.buffer.slice(0, cursorPosition))
        const afterCursor = new Uint8Array(passwordData.value.buffer.slice(cursorPosition + 1, passwordData.value.byteLength))
        if (event.ctrlKey) {
          newValue.set(afterCursor)
        } else {
          newValue.set(beforeCursor)
          newValue.set(afterCursor, cursorPosition)
        }

        // overwrite old and temporary value with zeros
        overwriteArray(passwordData.value)
        overwriteArray(beforeCursor)
        overwriteArray(afterCursor)

        passwordData.value = newValue
        if (event.ctrlKey) {
          cursorPosition = -1
        } else {
          cursorPosition--
        }
      } else if (event.key === 'Delete') {
        if (cursorPosition >= passwordData.value.byteLength - 1) {
          return
        }

        // update value
        let newLength = passwordData.value.byteLength - 1
        if (event.ctrlKey) {
          newLength = cursorPosition + 1
        }
        const newValue = new Uint8Array(newLength)
        const beforeCursor = new Uint8Array(passwordData.value.buffer.slice(0, cursorPosition + 1))
        const afterCursor = new Uint8Array(passwordData.value.buffer.slice(cursorPosition + 2, passwordData.value.byteLength))
        if (event.ctrlKey) {
          newValue.set(beforeCursor)
        } else {
          if (cursorPosition >= 0) {
            newValue.set(beforeCursor)
            newValue.set(afterCursor, cursorPosition + 1)
          } else {
            newValue.set(afterCursor)
          }
        }

        // overwrite old and temporary value with zeros
        overwriteArray(passwordData.value)
        overwriteArray(beforeCursor)
        overwriteArray(afterCursor)

        passwordData.value = newValue
      } else {
        console.error('Unhandled event/key:')
        console.error(event)
        return
      }

      if (typeof input.oninput === 'function') {
        input.oninput(passwordData)
      }
      if (typeof input.onchange === 'function') {
        input.onchange(passwordData)
      }

      updateDotDisplay()
    })

    return passwordData
  }
})();