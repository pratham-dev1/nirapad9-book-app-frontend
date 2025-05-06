import React, {
  ChangeEvent,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { FormControl, InputAdornment, TextField } from "@mui/material";
import CustomButton from "../components/CustomButton";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { Search } from "@mui/icons-material";
import "../styles/faq.css";
import MsgIcon from "../styles/icons/MsgIcon";
import { useQuery } from "react-query";
import { GET_FAQ } from "../constants/Urls";
import request from "../services/http";
import Loader from "../components/Loader";

type QueAnsProps = {
  question: string;
  answer: string;
  type: string;
};

interface FaqProps {
  data: QueAnsProps[];
}

const Faq = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<QueAnsProps[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const { data, isLoading } = useQuery<FaqProps>("faq", () => request(GET_FAQ));

  useEffect(() => {
    if (data?.data) {
      setFaqs(data.data);
    }
  }, [data]);
  const CommonlyAskedQuestions = data?.data?.filter((i) => i.type === "common") || [];
  const MoreQuestions = data?.data?.filter((i) => i.type !== "common") || [];

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchValue(value);
    const filteredValue = data?.data?.filter((i) => i.question.toLowerCase().includes(value) || i.answer.toLowerCase().includes(value)) as QueAnsProps[];
    setFaqs(filteredValue);
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="page-wrapper top_algn-clr-mode">
        <div className="d-flex">
          <h1 className="mt-0">
            <span
              className="back-to mr-10 cursur-pointer"
              onClick={() => navigate("/settings")}
            >
              <BackArrowIcon />
            </span>
            FAQs
          </h1>
        </div>

        <div className="w-100 pad-30 br-10 grdnt-bg-1">
          <h2 className="text-center">Frequently Asked Questions</h2>
          <p className="text-center mb-30">
            Find answers to common questions about our services and features.
            <br />
            How can we help you?
          </p>
          <div className="faq_srch_col d-flex justify-center mb-10">
            <FormControl className="w-100 mw-500">
              <TextField
                size="small"
                variant="outlined"
                className="w-100"
                placeholder="Search by topic, keyword or phrase"
                onChange={handleSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </div>
        </div>
      </div>

      {!searchValue ? (
        <>
          <div className="w-100 sec-bg-2 pad-30 mb-50">
            <div className="container-width">
              <h2 className="text-center mb-50">Commonly Asked Questions</h2>
              <div className="w-100 d-flex justify-between pad-30">
                <div className="w-48">
                  {CommonlyAskedQuestions?.map((item) => {
                    return (
                      <div className="faq-item">
                        <span className="faq_icn">
                          <MsgIcon />
                        </span>
                        <div
                          dangerouslySetInnerHTML={{ __html: item.question }}
                        />
                        <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="page-wrapper">
            <h2 className="text-center">Browse Additional FAQs Below</h2>
            <div className="faq-list w-100 pad-30 mb-70">
              {MoreQuestions?.map((item) => {
                return (
                  <div className="faq-item bdr-btm-1 pb-30 mb-30">
                    <span className="faq_icn">
                      <MsgIcon />
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: item.question }} />
                    <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="page-wrapper">
          {faqs.length > 0 ? (
            <>
              <h2 className="text-center">Searched Results ({faqs.length})</h2>
              <div className="faq-list w-100 pad-30 mb-70">
                {faqs?.map((item) => {
                  return (
                    <div className="faq-item bdr-btm-1 pb-30 mb-30">
                      <span className="faq_icn">
                        <MsgIcon />
                      </span>
                      <div
                        dangerouslySetInnerHTML={{ __html: item.question }}
                      />
                      <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-center">No Data found</h2>
            </div>
          )}
        </div>
      )}
      <div className="mb-50">
        <div className="text-center mb-10">
          Still have questions? Contact our support team.
        </div>
        <div className="d-flex justify-center">
          <CustomButton className="primary_btns" label="Support" onClick={() => navigate('/email-support')} />
        </div>
      </div>
    </>
  );
};

export default Faq;
