// TODO: allow to provide a max length
// TODO: allow to disable dot display
// TODO: allow enter callback

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

    ' ', '*', '^', '&', '/', '\\', '(', ')', '{', '}', '<', '>', '[', ']', '#', '@', '!', '?', '.', ',',
    ';', ':', "'", '"', '%', '$', '~', '+', '-', '_', '`', '|',
  ]
  const HANDLED_KEYS = CONTROL_KEYS + ALLOWED_KEYS
  const ONSCREEN_KEYBOARD_KEYS = [
    [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '\\'],
      ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ArrowLeft', 'ArrowRight'],
    ],
    [
      ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'Backspace'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', '|'],
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'ArrowLeft', 'ArrowRight'],
    ]
  ]

  function overwriteArray (array) {
    for (let i = 0; i < array.byteLength; i++) {
      array[i] = 0
    }
  }

  window.createSecurePasswordInput = (input) => {
    const passwordData = {
      value: new Uint8Array(0)
    }
    let cursorPosition = -1

    passwordData.setValue = value => {
      overwriteArray(passwordData.value)
      passwordData.value = value
      cursorPosition = passwordData.value.byteLength - 1
      updateDotDisplay()
    }

    passwordData.clear = () => {
      overwriteArray(passwordData.value)
      passwordData.value = new Uint8Array(0)
      cursorPosition = -1
      updateDotDisplay()
    }

    // make element focusable so we can listen to events
    input.tabIndex = 0

    input.classList.add('secure-password-input')

    const cursor = document.createElement('span')
    cursor.classList.add('cursor')
    cursor.innerText = 'l'

    // create on-screen keyboard
    const keyboard = document.createElement('div')
    keyboard.classList.add('onscreen-keyboard', 'hidden')
    input.parentNode.insertBefore(keyboard, input.nextSibling)
    // add keys
    ONSCREEN_KEYBOARD_KEYS.forEach((keyboardInstance, keyboardInstanceNumber) => {
      keyboardInstance.forEach(keyboardRow => {
        keyboardRow.forEach(key => {
          const keyElem = document.createElement('div')
          if (key === 'Backspace') {
            keyElem.textContent = '🡄'
            keyElem.classList.add('backspace-key')
          } else if (key === 'Shift') {
            keyElem.textContent = '⇧'
            keyElem.classList.add('shift-key')
          } else if (key === 'ArrowLeft') {
            keyElem.textContent = '←'
            keyElem.classList.add('arrow-key')
          } else if (key === 'ArrowRight') {
            keyElem.textContent = '→'
            keyElem.classList.add('arrow-key')
          } else {
            keyElem.textContent = key
          }
          keyElem.classList.add('key')
          if (keyboardInstanceNumber === 0) {
            keyElem.classList.add('no-shift')
          } else {
            keyElem.classList.add('shift')
          }
          keyElem.addEventListener('click', event => {
            event.preventDefault()
            input.focus()
            if (key === 'Shift') {
              if (keyboard.classList.contains('shift-active')) {
                keyboard.classList.remove('shift-active')
              } else {
                keyboard.classList.add('shift-active')
              }
            } else {
              input.dispatchEvent(new KeyboardEvent('keydown', {key}))
            }
          })
          keyboard.appendChild(keyElem)
        })
        const lineBreak = document.createElement('div')
        keyboard.appendChild(lineBreak)
      })
    })

    const keyboardToggle = document.createElement('span')
    keyboardToggle.classList.add('onscreen-keyboard-toggle')
    keyboardToggle.addEventListener('click', () => {
      if (keyboard.classList.contains('hidden')) {
        keyboard.classList.remove('hidden')
        keyboardToggle.classList.add('active')
      } else {
        keyboard.classList.add('hidden')
        keyboardToggle.classList.remove('active')
      }
    })

    function updateDotDisplay () {
      input.innerHTML = ''
      if (cursorPosition === -1) {
        input.appendChild(cursor)
      }
      for (let i = 0; i < passwordData.value.byteLength; i++) {
        input.innerHTML += '&bull;'
        if (cursorPosition === i) {
          input.appendChild(cursor)
        }
      }
      input.appendChild(keyboardToggle)
    }

    updateDotDisplay()

    // listen to keys
    input.addEventListener('keydown', event => {
      if (typeof input.onenter === 'function' && event.key === 'Enter') {
        input.onenter(passwordData)
        return
      }

      if (HANDLED_KEYS.indexOf(event.key) === -1) {
        return
      }
      // ignore ctrl and alt keys, except if it is ctrl-arrow or ctrl-backspace
      if (
        (event.ctrlKey && !(event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          || event.key === 'Backspace' || event.key === 'Delete'))
        || event.altKey || event.metaKey) {
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
})()
