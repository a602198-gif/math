# 分數變身！披薩闖關

四年級假分數與帶分數互換遊戲。包含三種練習模式、即時回饋、圖像提示、集星，以及答對後的披薩裝盒／拆片動畫。

## 在電腦直接遊玩

解壓縮後，將全部檔案保留在同一個資料夾，使用瀏覽器開啟 index.html。

## 用 GitHub Pages 發布

1. 登入 https://github.com ，按右上角「＋」→「New repository」。
2. Repository name 輸入 pizza-fraction-game；若使用 GitHub Free，選 Public。勾選 Add a README file（若介面顯示 Add README，將其開啟），再按 Create repository。
3. 進入儲存庫的 Code 頁面，按 Add file → Upload files。
4. 上傳解壓縮後的 index.html、game.js、pizza-animation.css、pizza-animation.js；README.md 可一併上傳。請上傳檔案本身，不要上傳 ZIP 或外層資料夾。
5. 按 Commit changes，確認儲存到 main 分支。
6. 進入 Settings → Pages。在 Build and deployment 下設定：
   - Source：Deploy from a branch
   - Branch：main
   - Folder：/(root)
   - 按 Save
7. 等待發布完成，在同一頁按 Visit site。官方說明表示發布可能需要最多約 10 分鐘。若失敗，可查看 Actions 頁籤的部署紀錄。

網址通常是：https://你的GitHub帳號.github.io/pizza-fraction-game/
請以 Pages 頁面實際顯示的網址為準。發布後，學生可直接用網址遊玩，不需要登入 ChatGPT。

## 檔案用途

- index.html：遊戲主頁
- game.js：題目、作答與計分
- pizza-animation.js：披薩裝盒與拆片動畫
- pizza-animation.css：動畫視窗樣式

以上四個網站檔案須放在同一層，index.html 必須在儲存庫最上層。

## 之後更新

在 GitHub 上用 Add file → Upload files，上傳同名的新檔案並 Commit changes。GitHub Pages 會重新發布。

## 官方操作文件

https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
