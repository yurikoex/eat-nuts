import React, { Component, useEffect, useState } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'

import Victor from 'victor'
import * as kdTree from 'kd-tree-javascript'

import distance from './common/distance'

import squirrel from './creature/creatures/squirrel'
import nut from './object/objects/nut'

import range from './common/range'
import actions from './common/actions'
import { Subject } from 'rxjs'

const numOfSquirrels = process.argv[2] || 1000
const numOfNuts = process.argv[3] || 1000
const x = process.argv[4] || 100
const y = process.argv[5] || 100

export default async ({
    processSquirrel,
    processNut,
    disposeParallelJobRunner,
}) => {
    const uiLoggerSubject = new Subject()
    class App extends Component {
        constructor() {
            super()
            this.state = { logs: [] }
        }
        componentDidMount() {
            this.unsub = uiLoggerSubject.subscribe(msg =>
                this.setState(state => ({
                    ...state,
                    logs:
                        state.logs.length > 99
                            ? state.logs.slice(1, 100).concat([msg])
                            : state.logs.concat([msg]),
                }))
            )
        }
        render() {
            return (
                <box
                    parent={screen}
                    label="Squirrel Sim"
                    border={{ type: 'line' }}
                    style={{ border: { fg: 'blue' } }}
                    width="100%"
                    height="100%"
                >
                    <box
                        label="World"
                        top={0}
                        height="50%-1"
                        border={{ type: 'line' }}
                        style={{ border: { fg: 'blue' } }}
                    />
                    <list
                        label="logs"
                        // widsth="100%"
                        height="50%"
                        bottom={0}
                        // abottom="0s"
                        border={{ type: 'line' }}
                        style={{ border: { fg: 'blue' } }}
                        items={this.state.logs.reverse()}
                        interactive={false}
                    />
                </box>
            )
        }
    }

    // Creating our screen
    const screen = blessed.screen({
        autoPadding: true,
        smartCSR: true,
        title: 'react-blessed hello world',
    })

    // Adding a way to quit the program
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0)
    })

    // Rendering the React app using our screen
    const component = render(<App />, screen)

    const topLeft = new Victor(0, y)
    const bottomRight = new Victor(x, 0)

    const initialNuts = range(numOfNuts)
        .map(() => Victor(1, 1).randomize(topLeft, bottomRight))
        .map(({ x, y }) => nut({ x, y }))

    const initialSquirrels = range(numOfSquirrels)
        .map(() => Victor(1, 1).randomize(topLeft, bottomRight))
        .map(({ x, y }) => squirrel({ x, y }))

    const getNeighbors = values =>
        new kdTree.kdTree(values, distance, ['x', 'y'])

    const tick = async ({
        nuts = initialNuts,
        squirrels = initialSquirrels,
    } = {}) => {
        const start = Date.now()
        // console.log('tick starting')

        // console.log('building neighbors')
        const neighbors = getNeighbors([...nuts, ...squirrels])

        // console.log('process each squirrel')
        const squirrelsCompletedCalls = await Promise.all(
            squirrels.map(async squirrel => {
                const surroundings = neighbors.nearest(
                    squirrel,
                    squirrel.awareness.max,
                    squirrel.awareness.distance
                )
                return await processSquirrel({
                    squirrel,
                    surroundings: surroundings.map(([item]) => item),
                })
            })
        )
        const {
            processingTime,
            squirrelsCompleted,
        } = squirrelsCompletedCalls.reduce(
            (
                calls,
                {
                    meta: {
                        // success,
                        // worker: { pid },
                        timing: {
                            // start,
                            duration,
                        },
                    },
                    result,
                }
            ) => {
                calls.processingTime += duration
                calls.squirrelsCompleted.push(result)
                return calls
            },
            {
                processingTime: 0,
                squirrelsCompleted: [],
            }
        )

        // console.log(`Squirrels Complete`)
        // console.log(JSON.stringify(squirrelsCompleted, null, '\t'))

        // console.log(`Removing nuts eating by squirrels`)
        const eatenIds = squirrelsCompleted
            .filter(s => s.action === actions.eating)
            .reduce(
                (ids, { contains }) => [...ids, contains.map(({ id }) => id)],
                []
            )

        const remainingNuts = nuts.filter(
            ({ id }) => eatenIds.indexOf(id) !== -1
        ) //nasty o^2
        const end = Date.now()
        uiLoggerSubject.next(
            `duration: ${end - start} processing time: ${processingTime}`
        )
        tick({ squirrels: squirrelsCompleted, nuts: remainingNuts })
    }

    try {
        tick()
    } catch (error) {
        console.log(error)
        await disposeParallelJobRunner()
        process.exit(1)
    }
}
