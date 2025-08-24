initialize();


async function initialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');
  const response = await fetch(`/api/session-status?session_id=${sessionId}`);
  const session = await response.json();

  if (session.status == 'open') {
    window.location.replace('http://localhost:3000/')
  } else if (session.status == 'complete') {
    document.getElementById('success').classList.remove('hidden');
  }

}

