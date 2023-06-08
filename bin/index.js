#!/usr/bin/env node
const { program } = require('commander')
const figlet = require('figlet')
const inquirer = require('inquirer')
const gitClone = require('git-clone')
const ora = require('ora')
const chalk = require('chalk')
const pack = require('../package.json')
const path = require('path')
const fs = require('fs-extra')

// 首行提示
program.name(pack.name).usage('<command> [options]')

// 版本号
program.version(pack.version)

// 创建项目的命令
program
  .command('create <app-name>')
  .description('create a new project')
  .action(async (name) => {
    // 创建一个名字为 name 的文件夹，把我们的模板项目的代码放到里面
    // 1、先判断有没有为 name 的文件
    const currentPath = path.join(process.cwd(), name)
    // console.log(currentPath)
    // console.log(fs.pathExistsSync(currentPath))
    if (fs.pathExistsSync(currentPath)) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          message: '是否需要覆盖之前的文件夹?',
          default: false,
          name: 'overwrite'
        }
      ])
      // 如果选择 yes 就删除该文件夹
      if (answer.overwrite) {
        fs.remove(currentPath)
        console.log('delete success!!!')
        return
      }
    }

    // 2、创建项目
    const res = await inquirer.prompt([
      {
        type: 'list',
        message: '选择什么框架去新建项目?',
        name: 'type',
        choices: [
          {
            name: 'vue',
            value: 'vue'
          },
          {
            name: 'react',
            value: 'react'
          },
        ]
      },
      {
        type: 'list',
        message: '是否选择typescript?',
        name: 'ts',
        choices: [
          {
            name: '是',
            value: true
          },
          {
            name: '否',
            value: false
          },
        ]
      }
    ])

    const projectList = {
      'vue': 'https://github.com/jackbrens/vue3-init.git',
      'react': 'git@github.com:kfc-vme50/react-template.git',
      'react&ts' : 'git@github.com:kfc-vme50/react-template-ts.git',
      'vue&ts' : 'git@github.com:kfc-vme50/vue-template-ts.git'
    }
    const key = res.type + (res.ts ? '&ts' : '')
    const spinner = ora('下载中...').start()
    // console.log(projectList[key])

    // 克隆代码到文件中
    gitClone(projectList[key], name, { checkout: 'main' }, (err) => {
      if (err) {
        spinner.fail('下载失败...')
        console.log(err)
      } else {
        spinner.succeed('下载成功...')
        fs.remove(currentPath + '/.git')
        console.log('\n')
        console.log(' Done, now run: \n')
        console.log(chalk.green(` cd ${name}`))
        console.log(chalk.green(' npm install'))
        console.log(chalk.green(' npm run dev'))
        console.log('\n')
      }
    })
  })

// 给help 添加一些提示
program.on('--help', function () {
  console.log(chalk.yellow.bold('this project is very niubi'))
})

program.parse(process.argv)