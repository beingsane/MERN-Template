export default ({markup, css}) => {
    return `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="google" content="notranslate" />
          <title>MERN Template</title>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Muli:300,400:latin"
          />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <style>
            a, a:focus {
              font-weight: 400;
              color: #0336FF;
              text-decoration: none;
              outline: none;
            }
            a:hover, button:hover {
              opacity: 0.75;
              cursor: pointer;
            }
            body{
              padding: 0;
              margin:0;
              background-color: #f7f7f7
            }
          </style>
        </head>
        <body>
          <div id="root">${markup}</div>
          <style id="jss-server-side">${css}</style>
          <script type="text/javascript" src="/dist/bundle.js"></script>
        </body>
      </html>`
}