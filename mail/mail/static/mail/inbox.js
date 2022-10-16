document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#mail-content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //fetch mailbox to load data of "mailbox" parameter
  fetch('/emails/' + mailbox)
  // Put response into json form
  .then(response => response.json())
  .then(data => {
      len = data.length;
      for (let i = len - 1; i >= 0; i--) {
        const newDiv = document.createElement('div');
        const newP = document.createElement('p');
        // const newButton = `<button onclick="archive(${mailbox})" class="btn btn-sm btn-outline-primary" id="archive">Archive</button>`;

        //archive button
        if(mailbox == 'inbox') {
            const newButton = document.createElement('button');
            newButton.className= "btn btn-sm btn-outline-primary";
            newButton.setAttribute('id', "archive");
            newButton.addEventListener('click', () => archive(data[i].id));
            newButton.innerHTML = "Archive";
            newDiv.appendChild(newButton);
          } else if (mailbox == 'archive') {
            const newButtonU = document.createElement('button');
            newButtonU.className= "btn btn-sm btn-outline-primary";
            newButtonU.setAttribute('id', "unarchive");
            newButtonU.addEventListener('click', () => unarchive(data[i].id));
            newButtonU.innerHTML = "Unarchive";
            newDiv.appendChild(newButtonU);
        }
        newP.innerHTML = `Sender: ${data[i].sender}, Subject: ${data[i].subject}, Timestamp: ${data[i].timestamp}`
        newP.addEventListener('click', () => loadMailContent(data[i].id));
        // if(mailbox != 'sent' ) newDiv.appendChild(newButton);
        newDiv.appendChild(newP);
        // newDiv.addEventListener('click', () => loadMailContent(data[i].id));
        document.querySelector('#emails-view').appendChild(newDiv);
        // console.log(data);
        // if(mailbox == 'sent' ) newButton.style.display = 'none';
        console.log(data);
      }
  });
}

function send_mail(event){
  // avoid default submission
  event.preventDefault();
  
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  // console.log(recipients);
  // send data to python
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      // console.log(result);
      load_mailbox('sent');
  });
}

function loadMailContent(id){
  // Put response into json form
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
      })
  })

  fetch('/emails/' + id)
  .then(response => response.json())
  .then(data => {
      // console.log(data);
      const mailContent = document.querySelector('#mail-content-view');
      // markRead(id, data);
      mailContent.innerHTML = '';
      newP = document.createElement('p');
      newP.innerHTML = generateContent(data);
      mailContent.appendChild(newP);
      mailContent.style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
  });
}

function generateContent(data){
  str = `<strong>From:</strong> ${data.sender}<br>
        <strong>To:</strong> ${data.recipients}<br>
        <strong>Subject:</strong> ${data.subject}<br>
        <strong>Timestamp:</strong> ${data.timestamp}<br>
        <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button><br>
        <hr><br>
        ${data.body}`
  return str;
}

function archive(id){
  console.log(id);
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
      })
  })
  .then(load_mailbox('inbox'));
}

function unarchive(id){
  console.log(id);
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
      })
  })
  .then(load_mailbox('inbox'));
}