const electron = require('electron')
const { ipcRenderer } = electron
const $ = require('jquery')
const db = require('../utils/db')()
const { isEmpty } = require('lodash')
const AWS = require('aws-sdk')

function clearError () {
  $('#message').text('').addClass('is-hidden')
}

function displayError (message) {
  $('#message').text(message).removeClass('is-hidden')
}

function submitForm (e) {
  e.preventDefault()
  clearError()

  let keyName = $('#name').val()
  let region = $('#region').val()
  let keyId = $('#key_id').val()
  let plainText = $('#plain_text').val()

  if (isEmpty(keyName)) {
    return displayError('Please give your key a name')
  }

  if (isEmpty(region)) {
    return displayError('Region is required')
  }

  if (isEmpty(keyId)) {
    return displayError('Key Id is required')
  }

  if (isEmpty(plainText)) {
    return displayError('Cannot encrypt an empty text!')
  }

  const data = {
    name: keyName.trim(),
    key_id: keyId.trim(),
    plain_text: plainText.trim()
  }

  $('#submit').addClass('is-loading')

  const kms = new AWS.KMS({ region })
  kms.encrypt({
    KeyId: data.key_id,
    Plaintext: Buffer.from(data.plain_text)
  })
  .promise()
  .then(response => Buffer.from(response.CiphertextBlob, 'utf-8').toString('base64'))
  .then(response => {
    data.base64_text = response

    return db.keys.add({
      name: data.name,
      key_id: data.key_id,
      base64_text: response
    })
  })
  .then(response => {
    data.id = response
    $('#submit').removeClass('is-loading')
    ipcRenderer.send('item:add', JSON.stringify(data))
  })
  .catch(err => {
    $('#submit').removeClass('is-loading')
    return displayError(err.message)
  })
}

$(document).ready(function () {
  $('#form').on('submit', submitForm)
  $('#cancel').on('click', clearError)
})

// function submitForm (e) {
//   e.preventDefault()
//   const keyName = document.querySelector('#name').value
//
//   // db.keys.add({
//   //   name: keyName,
//   //   plaintext: document.querySelector('#plaintext').value
//   // }).then(response => {
//   //   console.log(response)
//   //   ipcRenderer.send('item:add', keyName)
//   // })
//   //   .catch(err => {
//   //     console.log(err)
//   //   })
// }
