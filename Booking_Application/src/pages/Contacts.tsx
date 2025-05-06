import React, { FC, useContext, useEffect, useState } from 'react'
import ContactBookIcon from '../styles/icons/ContactBookIcon'
import DropdownOutlinedIcon from '../styles/icons/DropdownOutlinedIcon'
import AddContact from './AddContact'
import { Drawer, TextField } from '@mui/material'
import CloseIcon from '../styles/icons/CloseIcon'
import AddIcon from '../styles/icons/AddIcon'
import request from '../services/http'
import { GET_CONTACTS, SAVE_MULTIPLE_CONTACTS } from '../constants/Urls'
import { useMutation, useQuery } from 'react-query'
import CustomCheckBox from '../components/CustomCheckbox'
import CustomButton from '../components/CustomButton'
import { queryClient } from '../config/RQconfig'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'
import Loader from '../components/Loader'
import { EventsContext } from '../context/event/EventsContext'

type ContactProps = {
    eventType?: any
    outsideMembers?: any[]; // Add this prop for outside members
    handleSelectOrRemoveContact?: any
    removedItem?: any;
    meetAttendees?: any[];
    selectedDraft?: any
}

const Contacts: FC<ContactProps> = ({eventType, outsideMembers,handleSelectOrRemoveContact, removedItem, meetAttendees = [], selectedDraft}) => {
    const {emailData} = useContext(EventsContext)
    const [openContactPickDialog, setopenContactPickDialog] = useState(false);
    const [openAddMemberContactDialog, setopenAddMemberContactDialog] = useState(false);
    const [contacts, setContacts] = useState<any[]>([])
    const [filteredOutsideMembers, setFilteredOutsideMembers] = useState<any[]>([])
    const [searchValue, setSearchValue] = useState('')
    const { data: contactsData } = useQuery('contacts', () => request(GET_CONTACTS))
    useEffect(() => {
        if(contactsData?.data) {
            setContacts(contactsData?.data)
        }
    },[contactsData, selectedDraft])

    useEffect(() => {
        setContacts(contactsData?.data || [])
    },[eventType])

    useEffect(() => {
        //filter records that are already in contact list
        setFilteredOutsideMembers(() => outsideMembers?.filter((i) => !contactsData?.data?.map((j: any) => j.email).includes(i.email)) as any[])
    },[outsideMembers,contactsData])

    useEffect(() => {
      setContacts(prev => prev.map(i => (i.email === removedItem?.email ? {...i, selected: false}: i)))
    }, [removedItem])

    useEffect(() => {
        setContacts((prev) => prev.map((i:any) => (meetAttendees?.map(j => j.email).includes(i.email) ? {...i, selected: true} : {...i, selected: false})))
    },[meetAttendees, contactsData])

    const { mutate, isLoading } = useMutation((body: object) => request(SAVE_MULTIPLE_CONTACTS, "post", body),{
        onSuccess: (data) => {
            queryClient.invalidateQueries('contacts')
            showToast(ToastActionTypes.SUCCESS, data?.message)
            // setFilteredOutsideMembers(outsideMembers?.filter((i) => !contactsData?.data?.map((j: any) => j.email).includes(i.email)) as any[])
            setopenAddMemberContactDialog(false)
        }
      })


    //   const handleRemoveContact = (item: any) => {
    //     // setMeetAttendees(prev => prev.filter((el) => el.email !== item.email))
    //     setContacts(prev => prev?.map(el => el.id === item.id ? {...el, selected: false} : el))
    //   }

    const handleContactSearch = (e: any) => {
        const value = e.target.value.toLowerCase().trim(); // Convert search term to lowercase
        setSearchValue(value)
        setContacts(() =>
            value.length > 0
                ? contactsData?.data?.filter((item: any) =>
                    item.firstname?.toLowerCase()?.includes(value) ||
                    item.email?.toLowerCase()?.includes(value)
                ).map((i:any) => (meetAttendees?.map(j => j.email).includes(i.email) ? {...i, selected: true} : i))      // for restore selected flag true 
                : contactsData?.data?.map((i:any) => (meetAttendees?.map(j => j.email).includes(i.email) ? {...i, selected: true} : i)) as []
        );
    };
    
    const handleRemoveOrAdd = (item: any) => {
        setFilteredOutsideMembers((prev: any[]) => prev.map((i) =>(i.email === item.email ? {...item, selected: !item.selected} : i )))
    }

    const handleSelectAllMembers = (e:any,value:any) => {
        setFilteredOutsideMembers((prev: any[]) => prev.map((i) =>({...i, selected: value})))
    }

    return (
        <>
            {isLoading && <Loader /> }
            <div className='d-flex justify-end mb-30'>
                <div className="pck_cntct_list_drpdwn">
                    <button type="button">
                        <ContactBookIcon />
                        <span>Contact List</span>
                        <DropdownOutlinedIcon />
                    </button>
                    <ul>
                        <li onClick={() => setopenContactPickDialog(true)}>Pick from contact list</li>
                        <AddContact text='Add to Contact list' />
                        <li onClick={() => setopenAddMemberContactDialog(true)}>Add Member to Contact</li>
                    </ul>
                </div>
            </div>
            <Drawer 
                anchor={"right"}
                title="Contact Pick List"
                open={openContactPickDialog}
                onClose={() => setopenContactPickDialog(false)}
                className="contact_pick_lst drwr_ovrlp"
                variant="persistent"
            >
                <div className="d-flex justify-between items-center bdr-btm-1 pl-20 pr-20 mb-0">
                    <h2>Contact List</h2>
                    <span className="cls_icn pointer" onClick={() => setopenContactPickDialog(false)}>
                        <CloseIcon />
                    </span>
                </div>

                <div className="contact-user-list">
                    <div className="contact-list-col pad-20">
                        <div className="cntct_src mb-30 pl-20 pr-20">
                            <TextField
                                label=""
                                className="inpt_bdr_btm w-100"
                                placeholder="Search"
                                onChange={handleContactSearch}
                                value={searchValue || ''}
                            />
                        </div>
                        <div className="contact-item-list pl-20 pr-20">
                            {contacts?.filter(i => i.email !== emailData?.[0].email)?.map(((item: any) => {
                                return <div 
                                className={`contact-item ${item.selected ? 'added' : ''}`}
                                // ${item.selected ? 'added' : ''}
                                onClick={() => handleSelectOrRemoveContact(item, setContacts)}
                                >
                                <div className="d-flex items-center mb-5">
                                    <div className="usr_img">
                                        <img src="/contact-user.png" alt="" />
                                    </div>
                                    <div className="usr_dtl d-flex flex-column">
                                        <span className="usr_nme">{item.firstname}</span>
                                        <span className="usr_eml">{item.email}</span>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <span className="usr_tg">Title</span>
                                    <span className="usr_tg">Group</span>
                                    <span className="usr_tg">Company</span>
                                </div>
                                {/* {item.selected ? <span className="contact-remove" onClick={() => handleRemoveContact(item, setContacts)}><CloseIcon /></span> */}
                                {/* : */}
                                {/* <span className="contact-remove" onClick={() => handleSelectContact(item, setContacts)}><AddIcon /></span> */}
                                {/* } */}
                            </div> 
                            }))}
                        </div>
                    </div>
                </div>
            </Drawer>


            <Drawer 
                anchor={"right"}
                title="Add Member to Contact List"
                open={openAddMemberContactDialog}
                onClose={() => setopenAddMemberContactDialog(false)}
                className="contact_pick_lst drwr_ovrlp"
            >
                <div className="d-flex justify-between items-center bdr-btm-1 pl-20 pr-20 mb-0">
                    <h2>Add Member to Contact List</h2>
                    <span className="cls_icn pointer" onClick={() => setopenAddMemberContactDialog(false)}>
                        <CloseIcon />
                    </span>
                </div>

                <div className="contact-user-list">
                    <div className="contact-list-col pad-20">
                        <div className='w-100 d-flex justify-between items-center pl-10 pr-20 mb-10'>
                           {filteredOutsideMembers?.filter(i => i.selected).length > 0 && <CustomCheckBox label="Select All" labelPlacement="end" checked={filteredOutsideMembers?.every(i => i.selected)} onChange={handleSelectAllMembers} /> }
                            <CustomButton label='Save' onClick={() => mutate({contacts: filteredOutsideMembers?.filter(i => i.selected)})} disabled={filteredOutsideMembers?.filter(i => i.selected).length === 0}/>
                        </div>
                        <div className="contact-item-list pl-20 pr-20">
                            {filteredOutsideMembers?.map((item: any) => {
                                return <div className={`contact-item member-item ${item.selected ? 'added' : ''}`} onClick={() => handleRemoveOrAdd(item)}>
                                <div className="d-flex items-center mb-5">
                                    <div className="usr_img">
                                        <img src="/contact-user.png" alt="" />
                                    </div>
                                    <div className="usr_dtl d-flex flex-column">
                                        <span className="usr_nme">Person Name</span>
                                        <span className="usr_eml">{item.email}</span>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <span className="usr_tg">Title</span>
                                    <span className="usr_tg">Group</span>
                                    <span className="usr_tg">Company</span>
                                </div>
                            </div>
                            })}
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Contacts