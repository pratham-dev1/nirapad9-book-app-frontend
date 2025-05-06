import React, { useContext, useEffect } from 'react'
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Availability from "../Availability";
import MergeCalendar from "../MergeCalendar"
import OpenAvailabilityHistory from "../OpenAvailabilityHistory";
import { CHECK_EXISTING_OPEN_AVAILABILITY_OR_SAVE, SAVE_SLOT_OPEN_AVAILABILITY } from '../../constants/Urls';
import '../../styles/DashboardStyle.css' // import css file
import CreateNewEvent from '../CreateNewEvent';
import CreateGroupEvent from '../CreateGroupEvent';
import { useTabList } from '../../hooks/useTabList';
import Loader from '../../components/Loader';
import CreateNewEventView from '../CreateNewEventAdvanceView';
import { useQueryParams } from "../../hooks/useSearchParams"
import EventManagement from '../EventManagement';
import { useUserTabActivity } from '../../hooks/useUserTabActivity';
import { AuthContext } from '../../context/auth/AuthContext';
import { Applications } from '../../utils/Enums';
import PersonalBookings from '../PersonalBookings';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, className, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      className={`${className}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ display: value === index ? 'block' : 'none' }}
      {...other}
    >
      <Box sx={{ p: 3 }}>
        <div>{children}</div>
      </Box>
    </div>
  );
}
const GeneralUserDashboard: React.FC = () => {
  const {setQueryParam, getQueryParam, searchParams} = useQueryParams()
  const {state} = useContext(AuthContext)
  const hasSlotBroadcastAppAccess = state.appAccess?.includes(Applications.SLOT_BROADCAST)
  const {data, isLoading} = useTabList()
  const filteredTabs = hasSlotBroadcastAppAccess ? data?.data : data?.data.filter((i: any) => i.tabId != 17) // slot broadcast tab
  const [value, setValue] = React.useState(parseInt(getQueryParam('tab') as string) ||  0);
  const { triggerUpdateUserTabActivity } = useUserTabActivity()

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setQueryParam({tab: `${newValue}`})
    triggerUpdateUserTabActivity(data?.data[newValue].tabNameOrgGiven)
 };

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
  useEffect(() => {
    setQueryParam({tab: `${getQueryParam('tab') || 0}`})
    setValue(parseInt(getQueryParam('tab') as string) || 0)
  },[searchParams])

  return (
    <>
    {isLoading ? <Loader /> :
      <div className='page-wrapper top_algn-clr-mode'>
          <Box sx={{ mx: 1, mt: 5 }}>
            <Box sx={{ display: 'flex', borderRadius: '10px 10px 0 0' }}>
              <Tabs value={value} onChange={handleChange}>
                {filteredTabs?.map((item: any, index: number) => {
                  return <Tab className="dashboard-tabs" sx={tabStyle} label={item.tabNameOrgGiven} {...a11yProps(index)} />
                })}
              </Tabs>
              {/* end of css  */}
            </Box>
            <TabPanel value={value} index={0} className="tab-panel-content">
              <CreateNewEventView />
            </TabPanel>
            <TabPanel value={value} index={1} className="tab-panel-content">
              <MergeCalendar tabIndex={value} />
            </TabPanel>
            {hasSlotBroadcastAppAccess && <TabPanel value={value} index={2} className="tab-panel-content">
              <Availability URL={CHECK_EXISTING_OPEN_AVAILABILITY_OR_SAVE} SAVE_SLOT_OPEN_AVAILABILITY={SAVE_SLOT_OPEN_AVAILABILITY} />
            </TabPanel>}
            <TabPanel value={value} index={hasSlotBroadcastAppAccess ? 3 : 2} className="tab-panel-content">
              <OpenAvailabilityHistory value={value} index={hasSlotBroadcastAppAccess ? 3 : 2} />
            </TabPanel>
            <TabPanel value={value} index={hasSlotBroadcastAppAccess ? 4 : 3} className="tab-panel-content">
              {/* <EventManagement value={value} index={hasSlotBroadcastAppAccess ? 4 : 3} /> */}
              <PersonalBookings value={value} index={hasSlotBroadcastAppAccess ? 4 : 3} />
            </TabPanel>
          </Box>
      </div>
}
    </>
  );
};

export default GeneralUserDashboard;