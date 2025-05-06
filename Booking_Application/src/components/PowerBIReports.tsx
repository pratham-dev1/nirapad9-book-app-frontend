//@ts-nocheck
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import Loader from './Loader';
import request from '../services/http';
import { GET_POWERBI_REPORT } from '../constants/Urls';
import { useQuery } from 'react-query';

const PowerBIReport = () => {
  const {data, isLoading, isSuccess} = useQuery(['powerbi-report'], () => request(GET_POWERBI_REPORT)) 

  const getEmbedUrl = () => {
    return data?.parameters ? `${data?.embedUrl}${data?.parameters} '${data?.username}'` : data?.embedUrl
  }

  return (
    <>
    {isLoading && <Loader/>}
    {isSuccess && <PowerBIEmbed
      embedConfig={{
        type: 'report',
        id: data?.reportId,
        embedUrl: getEmbedUrl(),
        accessToken: data?.accessToken,
        tokenType: models.TokenType.Embed,
        settings: {
            panes: {
                filters: {
                    expanded: false,
                    visible: false
                },
                pageNavigation: {
                  visible: false
                }
            },
        }
      }}
      eventHandlers={
        new Map([
          ['loaded', function () {
            console.log('Report loaded');
            if (window.report) {
              window.report.getPages()  
                .then(pages => {
                  const firstPage = pages[0]; // Assuming the first page is the one you want
                  window.report.setPage(firstPage.name)
                    .then(() => {
                      console.log(`Page ${firstPage.name} set as default`);
                    })
                    .catch(error => {
                      console.error('Error setting default page:', error);
                    });
                })
                .catch(error => {
                  console.error('Error getting pages:', error);
                });
            }
          }],
          ['rendered', function () {console.log('Report rendered');}],
          ['error', function (event: any) {console.log('Error:', event.detail);}]
        ])
      }
      cssClassName="report-style-class"
      getEmbeddedComponent={(embeddedReport) => {
        window.report = embeddedReport;
      }}
    />}
    </>
  );
};

export default PowerBIReport;
