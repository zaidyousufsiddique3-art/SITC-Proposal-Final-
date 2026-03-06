# 🏗️ Fixing the Firebase Storage CORS Issue

The reason your images are still missing in the PDF is a security setting in your Firebase Storage bucket. By default, Firebase blocks "reading" image pixels for PDF generation.

Since my local command to fix this for you failed with an **Access Denied (403)** error, you need to run the final step yourself or update the console.

### 🔌 Fix Option 1: Run this in your Terminal (Recommended)

I have already created the `cors.json` file in your project folder. Just run this command:

```bash
gsutil cors set cors.json gs://sitc-45e52.firebasestorage.app
```

> [!NOTE]
> If it still says Access Denied, first run `gcloud auth login` and make sure you are logged in as the owner of the project.

---

### 🌐 Fix Option 2: Using the Google Cloud Console (Manual)

If you don't want to use the terminal:

1.  Go to the [Google Cloud Console Storage Browser](https://console.cloud.google.com/storage/browser).
2.  Select your bucket: `sitc-45e52.firebasestorage.app`.
3.  Go to the **Permissions** tab.
4.  Scroll down to **CORS**.
5.  If you don't see a CORS tab, you must use the terminal method above (Cloud Console doesn't always have a UI for this).

---

### 🧪 Why this is necessary
When you **create** a proposal, the images are local (base64). When you **edit** a proposal, the images are URLs from Firebase. Browsers block scripts from "touching" pixels from a different domain unless this CORS policy is set.
