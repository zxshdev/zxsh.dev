import { $, fetch } from 'zx'
import {DateTime} from 'luxon'

interface GitHubApiContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
}

interface Repo {
  name: string;
  updatedAt: string;
}

const fetchSample = async () => {
  const resp = await fetch('https://api.github.com/repos/zxshdev/zxsh.dev/contents/scripts')
  const text = await resp.text()
  const gitHubApiContentList = JSON.parse(text) as GitHubApiContent[]

  gitHubApiContentList.map(gitHubApiContent => {
    console.log(gitHubApiContent.name)
  })
}

const ghSample = async () => {
  const repoListReulst = await $`gh repo list --json "name,updatedAt"`
  const repoList = JSON.parse(repoListReulst.stdout) as Repo[]

  const convertRepoList = repoList.map(repo => {
    return {
      name: repo.name,
      updatedAt: repo.updatedAt,
      updateDate: DateTime.fromISO(repo.updatedAt).toFormat('yyyy-MM-dd')
    }
  })
  console.log(convertRepoList[0])
}

const main = async () => {
  console.log("--- start gh sample ---")
  await ghSample()
  console.log("--- end gh sample ---")

  console.log("--- start fetch sample ---")
  await fetchSample()
  console.log("--- end fetch sample ---")
}

main().then(() => console.log('Success!'))
