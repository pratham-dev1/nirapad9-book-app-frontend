import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React from "react";
import UserList from "./UserList";
import Notifications from "./Notifications";
import Logs from "./Logs";
import RoleBaseManagement from "./RoleBaseManagement";
import '../../styles/DashboardStyle.css' // import css file
import { useTabList } from "../../hooks/useTabList";
import Loader from "../../components/Loader";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
}

const AdminDashboard: React.FC = () => {
  const {data, isLoading} = useTabList()
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, className, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        className={`${className}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <div>{children}</div>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const tabStyle = {
    '&.Mui-selected': {
      backgroundColor: '#ffffff',
      color: '#000000',
      background: 'linear-gradient(to bottom, #ffffff, transparent)',
      boxShadow: "3px 3px 7px #729ae2 inset"
    }
  }

  return (
    <>
    {isLoading ? <Loader /> : 
      <div className="page-wrapper top_algn-clr-mode">
        <Box sx={{ mx: 1, mt: 5 }}>
          <Box sx={{ display: 'flex', borderRadius: '10px 10px 0 0' }}>
            <Tabs value={value} onChange={handleChange}>
              {data?.data?.map((item: any, index: number)=>{
                return <Tab className="dashboard-tabs" sx={tabStyle} label={item.tabNameOrgGiven} {...a11yProps(index)} />
              })}
            </Tabs>
            {/* end of css  */}
          </Box>
          <TabPanel value={value} index={0} className="tab-panel-content">
            <UserList />
          </TabPanel>
          <TabPanel value={value} index={1} className="tab-panel-content">
            <Notifications />
          </TabPanel>
          <TabPanel value={value} index={2} className="tab-panel-content">
            <Logs />
          </TabPanel>
          <TabPanel value={value} index={3} className="tab-panel-content">
            <RoleBaseManagement />
          </TabPanel>
        </Box>
      </div>
}
    </>
  );
};

export default AdminDashboard;
