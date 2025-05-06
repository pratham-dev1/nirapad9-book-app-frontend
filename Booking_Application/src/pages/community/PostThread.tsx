import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import CustomButton from "../../components/CustomButton";
import BackArrowIcon from "../../styles/icons/BackArrowIcon";
import EyeIcon from "../../styles/icons/EyeIcon";
import CommentIcon from "../../styles/icons/CommentIcon";
import UpSolidIcon from "../../styles/icons/UpSolidIcon";
import LikeIcon from "../../styles/icons/LikeIcon";
import DislikeIcon from "../../styles/icons/DislikeIcon";

const PostThread = () => {
    const navigate = useNavigate();
    return (
            <>
                <div className="page-wrapper">
                    <div className="d-flex justify-between items-center pt-10 mb-20">
                        <span className='back-to prmy_bck_txt cursur-pointer' onClick={() => navigate('/community')}>
                            <BackArrowIcon /> Back
                        </span>
                        <CustomButton className="primary_btns mr-0" label="Submit Suggestion" />
                    </div>

                    <div className="post-thread-col">
                        <div className="pst_tit_col">
                            <div className="d-flex justify-end mb-50">
                                <span className="mr-20 font-bold">Manager Name</span>
                                <span className="pst_stus">Open</span>
                            </div>
                            <h2 className="pst_tit_txt mb-zero">CalMerge Suggestion</h2>
                            <p className="pst_catgy font-14 mt-0 mb-30">Related Product/Feature: Booking Application CalMerge</p>
                            <p className="font-12 ">1 days ago</p>
                            <div className="pst_vte">
                                <UpSolidIcon/>
                                <span className="pl-5">Upvote 10</span>
                            </div>

                        </div>
                        <div className="pst_descrp_col">
                            <div className="post-item">
                                <div className="d-flex justify-between items-center">
                                    <div className="d-flex items-center">
                                        <div className="usr_prf d-flex mr-40">
                                            <span className="usr_icon mr-10">
                                                <span>M</span>
                                            </span>
                                            <span className="d-flex items-center">
                                                by Mariya Abraham
                                            </span>
                                        </div>
                                        <div className="pst_tme mr-10">10 days ago</div>
                                        <div className="pst_vew d-flex items-center mr-20">
                                            <span className="d-flex mr-5"><EyeIcon /></span>
                                            <span className="vew_count">148</span>
                                        </div>
                                        <div className="pst_cmnt d-flex items-center mr-20">
                                            <span className="d-flex mr-5"><CommentIcon /></span>
                                            <span className="pst_count">2</span>
                                        </div>
                                    </div>
                                    <div className="d-flex items-center">
                                        <span className="d-flex items-center mr-15"><LikeIcon /> <span className="pl-5">10</span></span>
                                        <span className="d-flex items-center"><DislikeIcon /> <span className="pl-5">10</span></span>
                                    </div>
                                </div>
                                <div className="pst_content">
                                    <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Urna nunc id cursus metus aliquam eleifend mi in. Eu facilisis sed odio morbi quis commodo odio aenean sed. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. </p>
                                </div>
                            </div>
                        </div>
                        <div className="pst_rply_items_col">
                            <h3><span>1</span> reply</h3>
                            <div className="post-item">
                                <div className="d-flex justify-between items-center">
                                    <div className="d-flex items-center">
                                        <div className="usr_prf d-flex mr-40">
                                            <span className="usr_icon mr-10">
                                                <span>M</span>
                                            </span>
                                            <span className="d-flex items-center">
                                                by Mariya Abraham
                                            </span>
                                        </div>
                                        <div className="pst_tme mr-10">10 days ago</div>
                                        <div className="pst_vew d-flex items-center mr-20">
                                            <span className="d-flex mr-5"><EyeIcon /></span>
                                            <span className="vew_count">148</span>
                                        </div>
                                        <div className="pst_cmnt d-flex items-center mr-20">
                                            <span className="d-flex mr-5"><CommentIcon /></span>
                                            <span className="pst_count">2</span>
                                        </div>
                                    </div>
                                    <div className="d-flex items-center">
                                        <span className="d-flex items-center mr-15"><LikeIcon /> <span className="pl-5">10</span></span>
                                        <span className="d-flex items-center"><DislikeIcon /> <span className="pl-5">10</span></span>
                                    </div>
                                </div>
                                <div className="pst_content">
                                    <p className="pst_txt">Description:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Urna nunc id cursus metus aliquam eleifend mi in. Eu facilisis sed odio morbi quis commodo odio aenean sed. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pst_reply_form mb-70">
                        <h3>Replay</h3>
                        <TextareaAutosize className="w-100 mb-30"  aria-label="minimum height" minRows={12} placeholder="" />
                        <div className="d-flex justify-center mb-10">
                            <CustomButton label="Submit" className="primary_btns mr-0" />
                        </div>
                    </div>
                </div>
            </>
    )
}
export default PostThread;