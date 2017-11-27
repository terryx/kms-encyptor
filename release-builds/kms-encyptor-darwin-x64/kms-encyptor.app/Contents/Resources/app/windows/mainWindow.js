const electron = require('electron')
const { ipcRenderer } = electron
const $ = require('jquery')
const db = require('../utils/db')()
const Clipboard = require('clipboard')

function prependList (key) {
  $('#list').prepend(`
    <tr id="list-${key.id}">
      <td class="">${key.name}</td>
      <td class="actions-td">
        <button class="button is-small copyToClipboard" data-clipboard-text="${key.base64_text}">Copy Text</button>
      </td>
      <td> <button class="delete is-medium is-pulled-right is-danger" data-id="${key.id}">Remove</button></td>
    </tr>
  `).html()
}

function renderList () {
  db.keys.each(key => {
    prependList(key)

    return key
  })
  .catch(err => {
    console.log(err)
  })
}

function removeKey (e) {
  const id = $(e.currentTarget).data().id
  db.keys.delete(id)
    .then(() => {
      $('#list-' + id).remove()
    })
    .catch(err => console.error(err))
}

$(document).ready(function () {
  renderList()
  const clipboard = new Clipboard('.copyToClipboard')
  clipboard.on('success', function (e) {
    $(e.trigger).html('Text copied')
    setTimeout(function () {
      $(e.trigger).html('Copy text')
    }, 2000)
  })

  $(document).on('click', '.is-danger', removeKey)

  ipcRenderer.on('item:add', function (e, item) {
    prependList(JSON.parse(item))
  })
})
