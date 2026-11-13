# Nexova Website

## Run locally

From the repository root, run:

```sh
npm install --prefix uis/website
npm run dev --prefix uis/website
```

The site listens on port `8080`. In GitHub Codespaces, open the **Ports** view, forward port `8080`, and set its visibility to **Public** to create an externally accessible preview URL. The landing page is `/`, the talent registration form is `/application.html`, and the training syllabus is `/training.html`.

The registration form validates in the browser and simulates submission; it does not persist application data.
