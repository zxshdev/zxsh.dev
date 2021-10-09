#!/usr/bin/env zx --quiet

const HTML_TEMPLATE = `<html>
 <head>
  <link href="https://classic.yarnpkg.com/en/package/destyle.css" rel="stylesheet" />
  <style>
    html {
      height: 100%;
    }
    body {
      max-width: 1200px;
      margin: 0 auto;
      background: #fafafa;
      height: 100%;
      color: rgba(0, 0, 0, 0.82);
      word-break: break-word;
      word-wrap: break-word;
      font-family:  -apple-system, "Segoe UI", "Helvetica Neue", "Hiragino Kaku Gothic ProN", メイリオ, meiryo, sans-serif;;
    }
    th {
      padding: 5px;
      border: 1px solid black;
    }
    td {
      padding: 10px;
      border: 1px solid black;
    }
    table {
      margin: 1.2rem auto;
      width: auto;
      border-collapse: collapse;
      font-size: 0.95em;
      line-height: 1.5;
      word-break: normal;
      display: block;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
  </style>
 </head>
 <body>
   <h1>{repoName}</h1>
   {body}
 </body>
</html>
`

const GET_PR_LIST_NUMBER = 1000

const getYmd = (dt) => {
  const y = dt.getFullYear();
  const m = ("00" + (dt.getMonth()+1)).slice(-2);
  const d = ("00" + dt.getDate()).slice(-2);
  const result = `${y}/${m}/${d}`
  return result;
}

const getAllPrList = async (repoName, state) => {
  const execGhPrListReuslt = await $`gh pr list \
    --repo ${repoName} \
    --limit ${GET_PR_LIST_NUMBER} \
    --json 'number,title,mergedAt,body,state' \
    --state ${state}`

  const prJsonList = JSON.parse(execGhPrListReuslt.stdout)

  return prJsonList
}

const main = async () => {
  const repoName = argv["_"][0]
  const stageList = argv["_"][1].split(",")
  const mergedPrList = await getAllPrList(repoName, 'merged')

  const prNumberAndPrHash = {}
  mergedPrList.map(mergedPr => {
    prNumberAndPrHash[mergedPr.number] = { 
      body: mergedPr.body,
      mergedAt: mergedPr.mergedAt,
      number: mergedPr.number,
      state: mergedPr.state,
      title: mergedPr.title,
    }
  })

  const stageAndPrHash = {}

  stageList.map(stage => {
    const stagePrNumberAndAdditionalHash = {}
    const stageReleaseRegExp = new RegExp(`^Release ${stage}`)

    mergedPrList.map(pr => {
      if (stageReleaseRegExp.test(pr.title)) {
        const releasePrBodyExtractPrNumberRegexp = /^#(\d+?)\s.*/

        pr.body.split("\n").map(line => {
          const releasePrBodyExtractPrNumberRegexpResult = releasePrBodyExtractPrNumberRegexp.exec(line)
          if (releasePrBodyExtractPrNumberRegexpResult && releasePrBodyExtractPrNumberRegexpResult.length > 1) {
            const prNumber = releasePrBodyExtractPrNumberRegexpResult[1]
            stagePrNumberAndAdditionalHash[prNumber] = {
              releasePrNumber: pr.number,
              releasePrMergedAt: new Date(pr.mergedAt),
            }
          }
        })
      }
    })

    stageAndPrHash[stage] = stagePrNumberAndAdditionalHash
  })

  let html = HTML_TEMPLATE;

  let body = "<table>\n"
  let header = "<tr><td>number</td><td>title</td>";
  stageList.map(stageName => {
    header += `<td>${stageName}</td>`
  })
  header += "</tr>\n"
  body += header;

  const releaseRegExp = new RegExp(`^Release`)

  mergedPrList.filter(pr => releaseRegExp.test(pr.title) === false)
    .map((pr) => {
      let line = "<tr>"

      stageList.map((stage, index) => {
        if (index === 0) {
          line += `<td>${pr.number}</td><td>${pr.title}</td>`;
        }

        if (pr.number in stageAndPrHash[stage]) {
          line += `<td>${getYmd(stageAndPrHash[stage][pr.number].releasePrMergedAt)}</td>`
        } else {
          line += `<td></td>`
        }
      })
      line += "</tr>"
      body += line;
    })

  html = html.replace('{body}', body)
  html = html.replace('{repoName}', repoName)
  console.log(html)
}

await main()
