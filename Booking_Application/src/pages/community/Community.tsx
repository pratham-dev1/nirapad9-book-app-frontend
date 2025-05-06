import React, { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {FormControl, InputAdornment, TextField, Autocomplete, Drawer, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import {Accordion, AccordionSummary, AccordionDetails, Dialog, DialogContent} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomButton from "../../components/CustomButton";
import BackArrowIcon from "../../styles/icons/BackArrowIcon";
import { Search } from "@mui/icons-material";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import EyeIcon from "../../styles/icons/EyeIcon";
import CommentIcon from "../../styles/icons/CommentIcon";
import FilterIcon from "../../styles/icons/FilterIcon";
import CloseIcon from "@mui/icons-material/Close";
import CustomCheckBox from "../../components/CustomCheckbox";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import UpSolidIcon from "../../styles/icons/UpSolidIcon";

const Community = () => {
    const navigate = useNavigate();
    const [value, setValue] = React.useState('1');
    const [view, setView] = useState<any>('top_suggestion');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [openSuggestionDialog, setopenSuggestionDialog] = useState(false);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <>
            <div className="page-wrapper top_algn-clr-mode">
                <div className="d-flex">
                    <h1 className="mt-0">
                        <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/settings')} ><BackArrowIcon /></span>
                        Community
                    </h1>
                </div>

                <div className="w-100 pad-50 br-10 grdnt-bg-1">
                    <div className="faq_srch_col d-flex justify-center mb-10">
                        <FormControl className="w-100 mw-500">
                            <TextField
                                size="small"
                                variant="outlined"
                                className="w-100"
                                placeholder="Search suggestions by topic"
                                InputProps={{
                                    endAdornment: (
                                    <InputAdornment position="end">
                                        <Search />
                                    </InputAdornment>
                                    )
                                }}
                            />
                        </FormControl>
                    </div>
                </div>
                <div className="w-100 mw-1000 pad-50 mb-50 font-18 font-medium">
                    <p>Welcome to Our Community!</p>
                    <p>Hello [User's Name],</p>
                    <p>We're excited to see you here! This community thrives on your feedback and ideas. Whether you have a feature you'd love to see or something you'd like to change, your voice matters to us.</p>
                    <p className="font-bolder">Got a feature idea or something to improve?</p>
                    <p className="mb-50">Tell us your thoughts and help us create a better experience for everyone.</p>
                    <div className="d-flex items-center justify-center">
                        <button className="MuiButton-root primary_btns" onClick={() => setopenSuggestionDialog(true)} >
                            Submit Suggestion
                        </button>
                    </div>
                </div>
                <div className="cmunty_post_items">
                    <div className="pst_filter" onClick={() => setIsDrawerOpen(true)}>
                        <span className="pointer"><FilterIcon /></span>
                    </div>
                    {view === 'top_suggestion' ?

                        <>
                            <TabContext value={value}>
                                <TabList onChange={handleChange} >
                                    <Tab className="simple-tab font-bolder" label="Previous Suggestions" value="1" />
                                    <Tab className="simple-tab font-bolder" label="Top Suggestions" value="2" />
                                </TabList>
                                <TabPanel value="1">
                                    <div className="post-list">
                                        {/* Post Item Start */}
                                        <div className="post-item" onClick={() => navigate('/post-thread')}>
                                            <div className="d-flex justify-between items-center">
                                                <div className="d-flex items-center">
                                                    <div className="usr_prf d-flex mr-25">
                                                        <span className="usr_icon mr-10">
                                                            <span>M</span>
                                                        </span>
                                                        <span className="d-flex items-center">
                                                            by Mariya Abraham
                                                        </span>
                                                    </div>
                                                    <div className="pst_tme">10 days ago</div>
                                                </div>
                                                <div className="d-flex items-center">
                                                    <div className="pst_vew d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><EyeIcon /></span>
                                                        <span className="vew_count">148</span>
                                                    </div>
                                                    <div className="pst_cmnt d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><CommentIcon /></span>
                                                        <span className="pst_count">2</span>
                                                    </div>
                                                    <div className="pst_stus">
                                                        <span>Open</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pst_content">
                                                <h2 className="pst_title">CalMerge Suggestions</h2>
                                                <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                            </div>
                                            <div className="d-flex justify-between pst_cnct_item">
                                                <div className="w-60">
                                                    <span className="mr-20">Project Manager's Name</span>
                                                    <span>Contact</span>
                                                </div>
                                                <div className="vote_pst">
                                                    <span><UpSolidIcon /></span>
                                                    <span className="vte_cunt">10</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Post Item End */}

                                        {/* Post Item Start */}
                                        <div className="post-item" onClick={() => navigate('/post-thread')}>
                                            <div className="d-flex justify-between items-center">
                                                <div className="d-flex items-center">
                                                    <div className="usr_prf d-flex mr-25">
                                                        <span className="usr_icon mr-10">
                                                            <span>M</span>
                                                        </span>
                                                        <span className="d-flex items-center">
                                                            by Mariya Abraham
                                                        </span>
                                                    </div>
                                                    <div className="pst_tme">10 days ago</div>
                                                </div>
                                                <div className="d-flex items-center">
                                                    <div className="pst_vew d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><EyeIcon /></span>
                                                        <span className="vew_count">148</span>
                                                    </div>
                                                    <div className="pst_cmnt d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><CommentIcon /></span>
                                                        <span className="pst_count">2</span>
                                                    </div>
                                                    <div className="pst_stus">
                                                        <span>Delivered</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pst_content">
                                                <h2 className="pst_title">CalMerge Suggestions</h2>
                                                <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                            </div>
                                            <div className="d-flex justify-between pst_cnct_item">
                                                <div className="w-60">
                                                    <span className="mr-20">Project Manager's Name</span>
                                                    <span>Contact</span>
                                                </div>
                                                <div className="vote_pst">
                                                    <span><UpSolidIcon /></span>
                                                    <span className="vte_cunt">3</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Post Item End */}

                                        {/* Post Item Start */}
                                        <div className="post-item" onClick={() => navigate('/post-thread')}>
                                            <div className="d-flex justify-between items-center">
                                                <div className="d-flex items-center">
                                                    <div className="usr_prf d-flex mr-25">
                                                        <span className="usr_icon mr-10">
                                                            <span>M</span>
                                                        </span>
                                                        <span className="d-flex items-center">
                                                            by Mariya Abraham
                                                        </span>
                                                    </div>
                                                    <div className="pst_tme">10 days ago</div>
                                                </div>
                                                <div className="d-flex items-center">
                                                    <div className="pst_vew d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><EyeIcon /></span>
                                                        <span className="vew_count">148</span>
                                                    </div>
                                                    <div className="pst_cmnt d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><CommentIcon /></span>
                                                        <span className="pst_count">2</span>
                                                    </div>
                                                    <div className="pst_stus">
                                                        <span>Open</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pst_content">
                                                <h2 className="pst_title">CalMerge Suggestions</h2>
                                                <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                            </div>
                                            <div className="d-flex justify-between pst_cnct_item">
                                                <div className="w-60">
                                                    <span className="mr-20">Project Manager's Name</span>
                                                    <span>Contact</span>
                                                </div>
                                                <div className="vote_pst">
                                                    <span><UpSolidIcon /></span>
                                                    <span className="vte_cunt">10</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Post Item End */}
                                    </div>
                                </TabPanel>
                                <TabPanel value="2">
                                    <div className="post-list">
                                        {/* Post Item Start */}
                                        <div className="post-item" onClick={() => navigate('/post-thread')}>
                                            <div className="d-flex justify-between items-center">
                                                <div className="d-flex items-center">
                                                    <div className="usr_prf d-flex mr-25">
                                                        <span className="usr_icon mr-10">
                                                            <span>M</span>
                                                        </span>
                                                        <span className="d-flex items-center">
                                                            by Mariya Abraham
                                                        </span>
                                                    </div>
                                                    <div className="pst_tme">10 days ago</div>
                                                </div>
                                                <div className="d-flex items-center">
                                                    <div className="pst_vew d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><EyeIcon /></span>
                                                        <span className="vew_count">148</span>
                                                    </div>
                                                    <div className="pst_cmnt d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><CommentIcon /></span>
                                                        <span className="pst_count">2</span>
                                                    </div>
                                                    <div className="pst_stus">
                                                        <span>Open</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pst_content">
                                                <h2 className="pst_title">CalMerge Suggestions</h2>
                                                <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                            </div>
                                            <div className="d-flex justify-between pst_cnct_item">
                                                <div className="w-60">
                                                    <span className="mr-20">Project Manager's Name</span>
                                                    <span>Contact</span>
                                                </div>
                                                <div className="vote_pst">
                                                    <span><UpSolidIcon /></span>
                                                    <span className="vte_cunt">10</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Post Item End */}

                                        {/* Post Item Start */}
                                        <div className="post-item" onClick={() => navigate('/post-thread')}>
                                            <div className="d-flex justify-between items-center">
                                                <div className="d-flex items-center">
                                                    <div className="usr_prf d-flex mr-25">
                                                        <span className="usr_icon mr-10">
                                                            <span>M</span>
                                                        </span>
                                                        <span className="d-flex items-center">
                                                            by Mariya Abraham
                                                        </span>
                                                    </div>
                                                    <div className="pst_tme">10 days ago</div>
                                                </div>
                                                <div className="d-flex items-center">
                                                    <div className="pst_vew d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><EyeIcon /></span>
                                                        <span className="vew_count">148</span>
                                                    </div>
                                                    <div className="pst_cmnt d-flex items-center mr-20">
                                                        <span className="d-flex mr-5"><CommentIcon /></span>
                                                        <span className="pst_count">2</span>
                                                    </div>
                                                    <div className="pst_stus">
                                                        <span>Open</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pst_content">
                                                <h2 className="pst_title">CalMerge Suggestions</h2>
                                                <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                            </div>
                                            <div className="d-flex justify-between pst_cnct_item">
                                                <div className="w-60">
                                                    <span className="mr-20">Project Manager's Name</span>
                                                    <span>Contact</span>
                                                </div>
                                                <div className="vote_pst">
                                                    <span><UpSolidIcon /></span>
                                                    <span className="vte_cunt">10</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Post Item End */}
                                    </div>
                                </TabPanel>
                            </TabContext>
                            <div className="text-center">
                                <span className="see_all_link" onClick={() => setView('all_suggestion')}>See All Suggestions</span>
                            </div>
                        </>
                    :
                        <>
                            <div className="all_sugstn_title position-relative">
                                <span className='back-to mr-10 cursur-pointer' onClick={() => setView('top_suggestion')}>
                                    <BackArrowIcon /> Back
                                </span>
                                <h3>All Suggestions</h3>
                            </div>
                            <div className="post-list">
                                {/* Post Item Start */}
                                <div className="post-item" onClick={() => navigate('/post-thread')}>
                                    <div className="d-flex justify-between items-center">
                                        <div className="d-flex items-center">
                                            <div className="usr_prf d-flex mr-25">
                                                <span className="usr_icon mr-10">
                                                    <span>M</span>
                                                </span>
                                                <span className="d-flex items-center">
                                                    by Mariya Abraham
                                                </span>
                                            </div>
                                            <div className="pst_tme">10 days ago</div>
                                        </div>
                                        <div className="d-flex items-center">
                                            <div className="pst_vew d-flex items-center mr-20">
                                                <span className="d-flex mr-5"><EyeIcon /></span>
                                                <span className="vew_count">148</span>
                                            </div>
                                            <div className="pst_cmnt d-flex items-center mr-20">
                                                <span className="d-flex mr-5"><CommentIcon /></span>
                                                <span className="pst_count">2</span>
                                            </div>
                                            <div className="pst_stus">
                                                <span>Open</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pst_content">
                                        <h2 className="pst_title">CalMerge Suggestions</h2>
                                        <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                    </div>
                                    <div className="d-flex justify-between pst_cnct_item">
                                        <div className="w-60">
                                            <span className="mr-20">Project Manager's Name</span>
                                            <span>Contact</span>
                                        </div>
                                        <div className="vote_pst">
                                            <span><UpSolidIcon /></span>
                                            <span className="vte_cunt">10</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Post Item End */}

                                {/* Post Item Start */}
                                <div className="post-item" onClick={() => navigate('/post-thread')}>
                                    <div className="d-flex justify-between items-center">
                                        <div className="d-flex items-center">
                                            <div className="usr_prf d-flex mr-25">
                                                <span className="usr_icon mr-10">
                                                    <span>M</span>
                                                </span>
                                                <span className="d-flex items-center">
                                                    by Mariya Abraham
                                                </span>
                                            </div>
                                            <div className="pst_tme">10 days ago</div>
                                        </div>
                                        <div className="d-flex items-center">
                                            <div className="pst_vew d-flex items-center mr-20">
                                                <span className="d-flex mr-5"><EyeIcon /></span>
                                                <span className="vew_count">148</span>
                                            </div>
                                            <div className="pst_cmnt d-flex items-center mr-20">
                                                <span className="d-flex mr-5"><CommentIcon /></span>
                                                <span className="pst_count">2</span>
                                            </div>
                                            <div className="pst_stus">
                                                <span>Open</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pst_content">
                                        <h2 className="pst_title">CalMerge Suggestions</h2>
                                        <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                    </div>
                                    <div className="d-flex justify-between pst_cnct_item">
                                        <div className="w-60">
                                            <span className="mr-20">Project Manager's Name</span>
                                            <span>Contact</span>
                                        </div>
                                        <div className="vote_pst">
                                            <span><UpSolidIcon /></span>
                                            <span className="vte_cunt">10</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Post Item End */}

                                {/* Post Item Start */}
                                <div className="post-item" onClick={() => navigate('/post-thread')}>
                                    <div className="d-flex justify-between items-center">
                                        <div className="d-flex items-center">
                                            <div className="usr_prf d-flex mr-25">
                                                <span className="usr_icon mr-10">
                                                    <span>M</span>
                                                </span>
                                                <span className="d-flex items-center">
                                                    by Mariya Abraham
                                                </span>
                                            </div>
                                            <div className="pst_tme">10 days ago</div>
                                        </div>
                                        <div className="d-flex items-center">
                                            <div className="pst_vew d-flex items-center mr-20">
                                                <span className="d-flex mr-5"><EyeIcon /></span>
                                                <span className="vew_count">148</span>
                                            </div>
                                            <div className="pst_cmnt d-flex items-center mr-20">
                                                <span className="d-flex mr-5"><CommentIcon /></span>
                                                <span className="pst_count">2</span>
                                            </div>
                                            <div className="pst_stus">
                                                <span>Open</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pst_content">
                                        <h2 className="pst_title">CalMerge Suggestions</h2>
                                        <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </p>
                                    </div>
                                    <div className="d-flex justify-between pst_cnct_item">
                                        <div className="w-60">
                                            <span className="mr-20">Project Manager's Name</span>
                                            <span>Contact</span>
                                        </div>
                                        <div className="vote_pst">
                                            <span><UpSolidIcon /></span>
                                            <span className="vte_cunt">10</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Post Item End */}
                            </div>
                        </>
                        
                    }   
                </div>
            </div>

            <Drawer
                anchor={"right"}
                title="Post Filter"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                className="pst_filter_popup"
            >
                <div className="popup-inner">
                    <div className="d-flex justify-end">
                        <span className="cls_icn pointer" onClick={() => setIsDrawerOpen(false)}><CloseIcon /></span>
                    </div>
                    <h3 className="flt_tit">Filter</h3>
                    <div className="filter_items">
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-filter-item"
                            >
                                Status
                            </AccordionSummary>
                            <AccordionDetails>
                                <ul className="filter_options_list">
                                    <li className="">
                                        <CustomCheckBox label="" />
                                        <span>All Status</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Closed</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Delivered</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>In Development</span>
                                    </li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-filter-item"
                            >
                                Filter Option 2
                            </AccordionSummary>
                            <AccordionDetails>
                                <ul className="filter_options_list">
                                    <li className="">
                                        <CustomCheckBox label="" />
                                        <span>Option 1</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Option 2</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Option 3</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Option 4</span>
                                    </li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-filter-item"
                            >
                                Filter Option 3
                            </AccordionSummary>
                            <AccordionDetails>
                                <ul className="filter_options_list">
                                    <li className="">
                                        <CustomCheckBox label="" />
                                        <span>Option 1</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Option 2</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Option 3</span>
                                    </li>
                                    <li>
                                        <CustomCheckBox label="" />
                                        <span>Option 4</span>
                                    </li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </div>

            </Drawer>

            <Dialog open={openSuggestionDialog} >
                <div className="popup-header">
                    <h2>Share your Suggestions</h2>
                    <span onClick={() => setopenSuggestionDialog(false)}><CloseIcon /></span>
                </div>
                <DialogContent>
                    <div className="form_wrapper w-100 mw-700">
                        <div className="form-col mb-20">
                            <TextField className="w-100" label="Title" />
                        </div>
                        <div className="form-col mb-20">
                            <TextField className="w-100" label="Product Name" />
                        </div>
                        <div className="form-col mb-20">
                            <Autocomplete
                                disablePortal
                                options={['Option 1', 'Option 2', 'Option 3','Option 4']}
                                className="w-100"
                                renderInput={(params) => <TextField {...params} label="Product Area" />}
                            />
                        </div>
                        <div className="form-col mb-20">
                            <Autocomplete
                                disablePortal
                                options={['Feature 1', 'Feature 2', 'Feature 3','Feature 4']}
                                className="w-100"
                                renderInput={(params) => <TextField {...params} label="Feature" />}
                            />
                        </div>
                        <div className="form-col mb-20">
                            <Autocomplete
                                disablePortal
                                options={['Option 1', 'Option 2', 'Option 3','Option 4']}
                                className="w-100"
                                renderInput={(params) => <TextField {...params} label="Impact" />}
                            />
                        </div>
                        <div className="form-col mb-50">
                            <RadioGroup
                                defaultValue="addFeature"
                                name="radio-buttons-group"
                                className="d-flex justify-between items-center flex-row"
                            >
                                <FormControlLabel value="addFeature" control={<Radio />} label="Add a feature" />
                                <FormControlLabel value="removeFeature" control={<Radio />} label="Remove a feature" />
                                <FormControlLabel value="suggestFeature" control={<Radio />} label="Feedback/Suggestion" />
                            </RadioGroup>
                        </div>
                        <div className="form-col mb-30">
                            <TextareaAutosize  aria-label="minimum height" minRows={5} placeholder="Description" />
                        </div>
                        <div className="d-flex justify-center">
                            <button className="MuiButton-root primary_btns">Submit</button>
                        </div>
                    </div>
                    
                </DialogContent>
            </Dialog>

        </>

    )
}

export default Community;