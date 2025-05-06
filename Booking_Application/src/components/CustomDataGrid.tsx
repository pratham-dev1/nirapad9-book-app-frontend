import { Box } from '@mui/material'
import { DataGrid, DataGridProps } from '@mui/x-data-grid'


const CustomDataGrid: React.FC<DataGridProps> = (props) => {
  return (
    <Box sx={{ height: 675, width: "100%" }}>
      <DataGrid
        {...props}
        getRowHeight={() => 'auto'} 
      />
    </Box>
  )
}

export default CustomDataGrid