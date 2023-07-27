const solodrop = () => {
  const requestUrl = 'https://app.solodrop.com/api/check_theme_license';
  const storeData = {
    shop: document.currentScript.dataset.store
  };
  const storeActiveString = `_sd_${document.currentScript.dataset.store}_theme`;
  const solodropMainJS = document.currentScript.dataset.sd;
  const cookieValid = document.cookie
    .split('; ')
    .find((row) => row.startsWith(storeActiveString))
    ?.split('=')[1] == 'true' ? true : false;

  const loadSolodrop = (js) => {
    let script = document.createElement('script');
    script.src = js;
    script.defer = true;
    
    document.head.appendChild(script);
  }

  if (cookieValid) {
    loadSolodrop(solodropMainJS);
    return false;
  }

  const checkThemeLicense = async (url, data) => {
    const valid = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams(data),
    });

    return valid.json();
  }

  checkThemeLicense(requestUrl, storeData).then((data) => {
    initTheme(data);
  }).catch(function(error) {
    error.msg = 'failed';
    initTheme(error.msg);
  });

  const initTheme = (response) => {
    if (response && response.data?.theme_license_valid === true || response == 'failed') {
      loadSolodrop(solodropMainJS);
      // const nextDay = new Date(new Date().getTime() + 60 * 60 * 24 * 1000).toUTCString();
      const nextDay = new Date(new Date().getTime() + 60 * 60 * 6 * 1000).toUTCString()
      document.cookie = `${storeActiveString}=true; expires=${nextDay}`;
    }
    else {
      disableSolodrop();
    }
  }

  const disableSolodrop = () => {
    const disabledHTML = `
      <div class="solodrop-disabled">
        <div>
          <a href="https://solodrop.com" target="_blank" class="solodrop-disabled__logo">
            <img src="https://cdn.shopify.com/s/files/1/0411/1627/0750/files/solodrop-official-logo-white.svg?v=1668406343" alt="Solodrop">
          </a>
          <h1>Whoops! This store doesn't seem to have a valid Solodrop license.</h1>
          <p>You'll need to purchase a license in order to use Solodrop.</p>
          <div class="solodrop-disabled__action">
            <a href="https://solodrop.com" target="_blank" class="btn">Get Solodrop License</a>
          </div>
        </div>
      </div>
    `;

    if (document.readyState === "complete" 
    || document.readyState === "loaded" 
    || document.readyState === "interactive") {
      document.body.innerHTML = disabledHTML;
    }
    else {
      document.addEventListener("DOMContentLoaded", function() {
        document.body.innerHTML = disabledHTML;
      });
    }

    //delete cookie
    document.cookie = `${storeActiveString}=true; expires=${new Date(0).toUTCString()}`;
  }
}

solodrop();
