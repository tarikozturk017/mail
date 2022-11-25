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
        newDiv.setAttribute('id', "mail");
        const newP = document.createElement('p');
        newP.innerHTML = `Sender: ${data[i].sender}, Subject: ${data[i].subject}, Timestamp: ${data[i].timestamp}`
        newDiv.appendChild(newP);
        //archive/unarchive buttons
        if(mailbox == 'inbox') {
            const subDiv = document.createElement('div');
            const newButton = document.createElement('button');
            newButton.className= "btn btn-sm btn-outline-primary";
            newButton.setAttribute('id', "archive");
            newButton.addEventListener('click', () => archive(data[i].id));
            newButton.innerHTML = "Archive";
            subDiv.appendChild(newButton);
            newDiv.appendChild(subDiv);
          } else if (mailbox == 'archive') {
            const subDiv = document.createElement('div');
            const newButtonU = document.createElement('button');
            newButtonU.className= "btn btn-sm btn-outline-primary";
            newButtonU.setAttribute('id', "unarchive");
            newButtonU.addEventListener('click', () => unarchive(data[i].id));
            newButtonU.innerHTML = "Unarchive";
            subDiv.appendChild(newButtonU);
            newDiv.appendChild(subDiv);
        }
        
        newP.addEventListener('click', () => loadMailContent(data[i].id));
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
      const mailContent = document.querySelector('#mail-content-view');
      mailContent.innerHTML = '';
      newP = document.createElement('p');
      newP.innerHTML = generateContent(data);
      newP.querySelector('#reply').addEventListener('click', function(){
        reply(data);
      });
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
  .then(email => load_mailbox('inbox'));
}

function unarchive(id){
  console.log(id);
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
      })
  })
  .then(email => load_mailbox('inbox'));
}

function reply(data){
  compose_email();
  console.log(data);
  document.querySelector('#compose-recipients').value = data.sender;
  if (data.subject) document.querySelector('#compose-subject').value = `Re: ${data.subject}`;
  if (data.body) document.querySelector('#compose-body').value = `On ${data.timestamp} ${data.sender} wrote: ${data.body}`;
}
