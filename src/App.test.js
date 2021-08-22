const App = require("./App")
// @ponicode
describe("componentDidMount", () => {
    let inst

    beforeEach(() => {
        inst = new App.default()
    })

    test("0", async () => {
        await inst.componentDidMount()
    })
})
