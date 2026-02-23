import { QTab, QTable } from "quasar"

export default() => {
  QTable.props.pagination.default = () => ({
    rowsPerPage: 50
  })

  QTable.props.rowsPerPageOptions.default = () => [100, 50, 20, 10, 0]
}
