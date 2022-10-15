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
  // let url = '/emails/' + mailbox;
  fetch('/emails/' + mailbox)
  // Put response into json form
  .then(response => response.json())
  .then(data => {
      len = data.length;
      for (let i = len - 1; i >= 0; i--) {
        const newDiv = document.createElement('div');
        const newP = document.createElement('p');
        
        newP.innerHTML = `Sender: ${data[i].sender}, Subject: ${data[i].subject}, Timestamp: ${data[i].timestamp}`
        newDiv.appendChild(newP);
        newDiv.addEventListener('click', () => loadMailContent(data[i].id));
        document.querySelector('#emails-view').appendChild(newDiv);
      }
  });
}

function send_mail(event){
  // avoid default submission
  event.preventDefault();
  
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);
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
      console.log(result);
      load_mailbox('sent');
  });
}

function loadMailContent(id){
  // document.querySelector('#compose-recipients').value = ''
  fetch('/emails/' + id)
  // Put response into json form
  .then(response => response.json())
  .then(data => {
      // console.log(data);
      const mailContent = document.querySelector('#mail-content-view');
      // markRead(id, data);
      mailContent.innerHTML = '';
      newP = document.createElement('p');
      newP.innerHTML = `<strong>From:</strong> ${data.sender}<br>
                        <strong>To:</strong> ${data.recipients}<br>
                        <strong>Subject:</strong> ${data.subject}<br>
                        <strong>Timestamp:</strong> ${data.timestamp}<br>
                        <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button><br>
                        <hr><br>
                        ${data.body}`;
      mailContent.appendChild(newP);

      mailContent.style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
      // newP.innerHTML = "";
  });

 
}

function markRead(mailId){
  // let data = mailData;
  fetch('/emails' + mailId, {
    method: 'PUT',
    body: JSON.stringify({read: false})
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // load_mailbox('sent');
  });
}