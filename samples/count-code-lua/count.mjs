#!/usr/bin/env zx --quiet

const OUTPUT_DIRECTORY = "output"

const main = async () => {
  const repos = [
    'nvim-telescope/telescope.nvim',
    'nvim-lualine/lualine.nvim',
    'hrsh7th/nvim-cmp',
    'wbthomason/packer.nvim',
    'neovim/nvim-lspconfig',
    'mrjones2014/dash.nvim',
    'nvim-treesitter/nvim-treesitter',
    'norcalli/snippets.nvim',
    'savq/paq-nvim', // ミニマムパッケージマネージャー
    'romgrk/barbar.nvim', // tabline
    'akinsho/bufferline.nvim', // tabline
  ]


  const isExsits = await fs.pathExistsSync(OUTPUT_DIRECTORY)
  if (!isExsits) {
    await $`mkdir ${OUTPUT_DIRECTORY}`
  }
  cd(OUTPUT_DIRECTORY)


  const cloneResult = repos.map(repo => {
    return $`git clone https://github.com/${repo}`
  })

  await Promise.allSettled(cloneResult)

  const tokeiJsonList = await Promise.all(
    repos.map(async repo => {
      const repoName = path.basename(repo)
      const tokeiResult = await $`tokei ./${repoName} -t=lua --output json`
      const parsedTokeiJson = JSON.parse(tokeiResult.stdout)
      const stargazersCount = Number((await $`curl -sS https://api.github.com/repos/${repo}| jq '.stargazers_count'`).stdout.trim())

      return {
        repo: repo,
        luaCode: parsedTokeiJson.Lua.code,
        star: stargazersCount
      }
    })
  )

  console.log('<table>')
  tokeiJsonList.map(json => {
    console.log('<tr>')
    console.log(`<td>${json.repo}</td><td>${json.star}</td><td>${json.luaCode}</td>`)
    console.log('</tr>')
  })
  console.log('</table>')

}


await main()
