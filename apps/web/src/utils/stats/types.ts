export interface DuneResponse<Row> {
  execution_id: string
  query_id: number
  is_execution_finished: boolean
  state: string
  submitted_at: string
  expires_at: string
  execution_started_at: string
  execution_ended_at: string
  result: Result<Row>
}

interface Result<Row> {
  rows: Row[]
  metadata: Metadata
}

interface Metadata {
  column_names: string[]
  column_types: string[]
  row_count: number
  result_set_bytes: number
  total_row_count: number
  total_result_set_bytes: number
  datapoint_count: number
  pending_time_millis: number
  execution_time_millis: number
}
