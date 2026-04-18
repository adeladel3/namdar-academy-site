import MonCoachingSection from "@/components/MonCoachingSection";
import { getSetting } from "@/lib/db";

const imgUntitledPanorama8Copy1 = "/figma/untitledpanorama8copy1.png";
const imgRectangle33 = "/figma/rectangle33.png";
const imgRectangle34 = "/figma/rectangle34.png";
const imgRectangle37 = "/figma/rectangle37.png";
const imgDetail = "/figma/detail.png";
const imgLayer21 = "/figma/layer21.png";
const imgLayer3 = "/figma/layer3.png";
const imgF7Eff535B0Ed407AA6C3E4D475E4Fc741 = "/figma/f7eff535b0ed407aa6c3e4d475e4fc741.png";
const imgImage1 = "/figma/image1.png";
const imgLayer11 = "/figma/layer11.png";
const imgFinvestCopy1 = "/figma/finvestcopy1.png";
const imgUntitled1Copy1 = "/figma/untitled1copy1.png";
const imgLq1BannerCopy1 = "/figma/lq1bannercopy1.jpg";
const imgRectangle19 = "/figma/rectangle19.png";
const imgRectangle21 = "/figma/rectangle21.png";
const img1072Copy3 = "/figma/1072copy3.png";
const imgTt6A9115Copy2 = "/figma/tt6a9115copy2.png";
const imgPortraitTeacherGivingOnlineClass2 = "/figma/portraitteachergivingonlineclass2.jpg";
const imgImage9 = "/figma/image9.png";
const imgImage10 = "/figma/image10.png";
const imgImage11 = "/figma/image11.png";
const imgImage13 = "/figma/image13.png";
const imgImage15 = "/figma/image15.png";
const imgImage17 = "/figma/image17.png";
const imgImage18 = "/figma/image18.png";
const imgRectangle4496 = "/figma/rectangle4496.jpg";
const imgRectangle4498 = "/figma/rectangle4498.jpg";
const img1 = "/figma/1.jpg";
const imgRectangle32 = "/figma/rectangle32.png";
const imgPolygon2 = "/figma/polygon2.svg";
const imgLine10 = "/figma/line10.svg";
const imgLine11 = "/figma/line11.svg";
const imgRectangle39 = "/figma/rectangle39.svg";
const imgHeaderPic = "/figma/headerpic.svg";
const imgIcon8 = "/figma/icon8.svg";
const imgLayer02 = "/figma/layer02.svg";
const imgEllipse2913 = "/figma/ellipse2913.svg";
const imgEllipse2912 = "/figma/ellipse2912.svg";
const imgSearch = "/figma/search.svg";
const imgEllipse6 = "/figma/ellipse6.svg";
const imgGroup = "/figma/group.svg";
const imgGroup1 = "/figma/group1.svg";
const imgGroup2 = "/figma/group2.svg";
const imgGroup3 = "/figma/group3.svg";
const imgGroup4 = "/figma/group4.svg";
const imgGroup5 = "/figma/group5.svg";
const imgGroup6 = "/figma/group6.svg";
const imgGroup7 = "/figma/group7.svg";
const imgGroup8 = "/figma/group8.svg";
const imgGroup9 = "/figma/group9.svg";
const imgGroup10 = "/figma/group10.svg";
const imgGroup11 = "/figma/group11.svg";
const imgGroup81 = "/figma/group81.svg";
const imgGroup79 = "/figma/group79.svg";
const imgStar8 = "/figma/star8.svg";
const imgStar12 = "/figma/star12.svg";
const imgRectangle22 = "/figma/rectangle22.svg";
const img1072Copy2 = "/figma/1072copy2.svg";
const imgEllipse19 = "/figma/ellipse19.svg";
const imgEllipse20 = "/figma/ellipse20.svg";
const imgEllipse21 = "/figma/ellipse21.svg";
const imgEllipse22 = "/figma/ellipse22.svg";
const imgGroup67 = "/figma/group67.svg";
const imgPortraitTeacherGivingOnlineClass1 = "/figma/portraitteachergivingonlineclass1.svg";
const imgPortraitTeacherGivingOnlineClass3 = "/figma/portraitteachergivingonlineclass3.svg";
const imgImage8 = "/figma/image8.svg";
const imgImage7 = "/figma/image7.svg";
const imgImage12 = "/figma/image12.svg";
const imgGroup70 = "/figma/group70.svg";
const imgEllipse105 = "/figma/ellipse105.svg";
const imgEllipse108 = "/figma/ellipse108.svg";
const imgEllipse106 = "/figma/ellipse106.svg";
const imgEllipse107 = "/figma/ellipse107.svg";
const imgGroup90 = "/figma/group90.svg";
const imgGroup88 = "/figma/group88.svg";
const imgImage14 = "/figma/image14.svg";
const imgImage16 = "/figma/image16.svg";
const imgEllipse104 = "/figma/ellipse104.svg";
const imgGroup12 = "/figma/group12.svg";
const imgLine6 = "/figma/line6.svg";
const imgLine7 = "/figma/line7.svg";
const imgLine8 = "/figma/line8.svg";
const imgEllipse118 = "/figma/ellipse118.svg";
const imgPolygon3 = "/figma/polygon3.svg";
const imgGroup68 = "/figma/group68.svg";
const imgPhone1 = "/figma/phone1.svg";
const imgImage19 = "/figma/image19.svg";
const imgPortraitTeacherGivingOnlineClass4 = "/figma/portraitteachergivingonlineclass4.svg";
const imgMaskGroup = "/figma/maskgroup.svg";
const imgPortraitTeacherGivingOnlineClass5 = "/figma/portraitteachergivingonlineclass5.svg";
const imgImage20 = "/figma/image20.svg";
const imgGroup102 = "/figma/group102.svg";
const imgLine9 = "/figma/line9.svg";
const imgGroup105 = "/figma/group105.svg";
const imgGroup1000001986 = "/figma/group1000001986.svg";
const imgGroup1000001987 = "/figma/group1000001987.svg";

export default function Landing() {
  const monVideoUrl = getSetting<string>("landing.monVideoUrl") || "";
  const monPosterUrl =
    getSetting<string>("landing.monPosterUrl") ||
    "/figma/screenshot00080208at1732541.png";

  return (
    <div className="bg-white relative size-full" data-node-id="4:18" data-name="Landing">
      <div className="absolute h-[807px] left-[-27px] mix-blend-luminosity opacity-74 top-[1019px] w-[1944px]" data-node-id="4:19" data-name="Untitled_Panorama-8 copy 1">
        <div className="absolute inset-0 opacity-25 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[110.92%] left-0 max-w-none top-[-0.01%] w-full" src={imgUntitledPanorama8Copy1} />
        </div>
      </div>
      <div className="absolute contents left-[-11px] top-[9925px]" data-node-id="4:20" data-name="Footer">
        <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+309px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10434px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:21">{`© 2021 Class Technologies Inc. `}</p>
        <p className="-translate-x-1/2 absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[calc(33.33%+309px)] not-italic text-[26px] text-center text-white top-[10166px] tracking-[1.04px] whitespace-nowrap" data-node-id="4:22">
          Subscribe to get our Newsletter
        </p>
        <div className="absolute contents left-[calc(33.33%+115px)] top-[9988px]" data-node-id="4:23">
          <div className="absolute contents left-[calc(33.33%+115px)] top-[9988px]" data-node-id="4:24">
            <div className="absolute left-[calc(33.33%+115px)] size-[83px] top-[9988px]" data-node-id="4:25">
              <div className="absolute inset-[2.99%]">
                <img alt="" className="block max-w-none size-full" src={imgPolygon2} />
              </div>
            </div>
            <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-[calc(33.33%+137px)] not-italic text-[32px] text-white top-[10005px] tracking-[1.28px] whitespace-nowrap" data-node-id="4:26">
              Skilline
            </p>
          </div>
          <div className="absolute flex h-[83px] items-center justify-center left-[calc(41.67%+146px)] top-[9988px] w-0">
            <div className="flex-none rotate-90">
              <div className="h-0 relative w-[83px]" data-node-id="4:27">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine10} />
                </div>
              </div>
            </div>
          </div>
          <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[normal] left-[calc(50%+27px)] not-italic text-[22px] text-white top-[9997px] tracking-[0.88px] w-[156px]" data-node-id="4:28">
            Virtual Class for Zoom
          </p>
        </div>
        <div className="absolute contents left-[calc(33.33%+27px)] top-[10381px]" data-node-id="4:29">
          <div className="absolute flex h-[17px] items-center justify-center left-[calc(33.33%+140px)] top-[10389px] w-0">
            <div className="flex-none rotate-90">
              <div className="h-0 relative w-[17px]" data-node-id="4:30">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine11} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[17px] items-center justify-center left-[calc(50%+21px)] top-[10389px] w-0">
            <div className="flex-none rotate-90">
              <div className="h-0 relative w-[17px]" data-node-id="4:31">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine11} />
                </div>
              </div>
            </div>
          </div>
          <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+73.5px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10381px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:32">
            Careers
          </p>
          <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+240.5px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10381px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:33">
            Privacy Policy
          </p>
          <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(50%+156px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10381px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:34">{`Terms & Conditions`}</p>
        </div>
        <div className="absolute contents left-[-11px] top-[9925px]" data-node-id="4:35" data-name="Footer">
          <div className="absolute bg-[#252641] h-[593px] left-[-11px] top-[9925px] w-[1920px]" data-node-id="4:36" />
          <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+309px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10445px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:37">{`© 2021 Class Technologies Inc. `}</p>
          <p className="-translate-x-1/2 absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[calc(33.33%+309px)] not-italic text-[#b2b3cf] text-[26px] text-center top-[10177px] tracking-[1.04px] whitespace-nowrap" data-node-id="4:38">
            Subscribe to get our Newsletter
          </p>
          <div className="absolute contents left-[calc(33.33%+27px)] top-[10392px]" data-node-id="4:39">
            <div className="absolute flex h-[17px] items-center justify-center left-[calc(33.33%+140px)] top-[10400px] w-0">
              <div className="flex-none rotate-90">
                <div className="h-0 relative w-[17px]" data-node-id="4:40">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <img alt="" className="block max-w-none size-full" src={imgLine11} />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex h-[17px] items-center justify-center left-[calc(50%+21px)] top-[10400px] w-0">
              <div className="flex-none rotate-90">
                <div className="h-0 relative w-[17px]" data-node-id="4:41">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <img alt="" className="block max-w-none size-full" src={imgLine11} />
                  </div>
                </div>
              </div>
            </div>
            <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+73.5px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10392px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:42">
              Careers
            </p>
            <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+240.5px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10392px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:43">
              Privacy Policy
            </p>
            <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(50%+156px)] not-italic text-[#b2b3cf] text-[22px] text-center top-[10392px] tracking-[0.88px] whitespace-nowrap" data-node-id="4:44">{`Terms & Conditions`}</p>
          </div>
          <div className="absolute contents left-[calc(25%+170px)] top-[10236px]" data-node-id="4:45">
            <div className="absolute border border-[#83839a] border-solid h-[60px] left-[calc(25%+170px)] rounded-[80px] top-[10236px] w-[400px]" data-node-id="4:46" />
            <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(33.33%+96px)] not-italic text-[#83839a] text-[20px] text-center top-[10251px] tracking-[0.8px] whitespace-nowrap" data-node-id="4:47">
              Your Email
            </p>
            <div className="absolute contents left-[calc(50%+110px)] top-[10236px]" data-node-id="4:48">
              <div className="absolute bg-[#545ae8] blur-[27px] h-[29px] left-[calc(50%+122px)] opacity-50 rounded-[60px] top-[10266px] w-[151px]" data-node-id="4:49" />
              <div className="absolute bg-[#49bbbd] h-[60px] left-[calc(50%+110px)] rounded-[60px] top-[10236px] w-[179px]" data-node-id="4:50" />
              <p className="absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[calc(58.33%-16px)] not-italic text-[22px] text-white top-[10250px] whitespace-nowrap" data-node-id="4:51">
                Subscribe
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute contents left-[174px] top-[8861px]" data-node-id="4:52" data-name="Lastest News and Resources">
        <p className="absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[1.8] left-[calc(41.67%+66px)] not-italic text-[#2f327d] text-[36px] top-[8861px] whitespace-nowrap" dir="auto" data-node-id="4:53">
          بلاگ و محتوا
        </p>
        <p className="-translate-x-1/2 absolute font-['Nunito_Sans:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[1.8] left-[calc(33.33%+347px)] text-[#696984] text-[24px] text-center top-[8931px] whitespace-nowrap" dir="auto" data-node-id="4:54" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ
        </p>
        <div className="absolute contents left-[174px] top-[9089px]" data-node-id="4:55">
          <div className="absolute h-[200px] left-[calc(33.33%+67px)] rounded-[20px] top-[9089px] w-[280px]" data-node-id="4:56">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle33} />
          </div>
          <div className="absolute h-[200px] left-[calc(33.33%+67px)] top-[9089px] w-[280px]" data-node-id="4:57">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle39} />
          </div>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[1.8] left-[651px] not-italic text-[#252641] text-[26px] text-right top-[9089px] w-[477px]" dir="auto" data-node-id="4:58">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Light',sans-serif] leading-[1.52] left-[646px] not-italic text-[#252641] text-[24px] text-right top-[9210px] w-[447px]" dir="auto" data-node-id="4:59">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[1.8] left-[651px] not-italic text-[#252641] text-[26px] text-right top-[9332px] w-[477px]" dir="auto" data-node-id="4:60">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Light',sans-serif] leading-[1.52] left-[646px] not-italic text-[#252641] text-[24px] text-right top-[9453px] w-[447px]" dir="auto" data-node-id="4:61">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[1.8] left-[651px] not-italic text-[#252641] text-[26px] text-right top-[9589px] w-[477px]" dir="auto" data-node-id="4:62">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Light',sans-serif] leading-[1.52] left-[646px] not-italic text-[#252641] text-[24px] text-right top-[9710px] w-[447px]" dir="auto" data-node-id="4:63">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <div className="absolute contents left-[calc(41.67%+13px)] top-[9235px]" data-node-id="4:64">
            <div className="absolute bg-[#49bbbd] h-[34px] left-[calc(41.67%+13px)] rounded-[80px] top-[9235px] w-[154px]" data-node-id="4:65" />
            <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(41.67%+25px)] not-italic text-[18px] text-white top-[9239px] tracking-[0.36px] whitespace-nowrap" data-node-id="4:66">
              PRESS RELEASE
            </p>
          </div>
        </div>
        <div className="absolute contents left-[calc(33.33%+67px)] top-[9339px]" data-node-id="4:67">
          <div className="absolute contents left-[calc(33.33%+67px)] top-[9339px]" data-node-id="4:68">
            <div className="absolute h-[200px] left-[calc(33.33%+67px)] rounded-[20px] top-[9339px] w-[280px]" data-node-id="4:69">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle34} />
            </div>
            <div className="absolute bg-[#171b41] h-[200px] left-[calc(33.33%+67px)] opacity-10 rounded-[20px] top-[9339px] w-[280px]" data-node-id="4:70" />
          </div>
          <div className="absolute contents left-[calc(41.67%+67px)] top-[9485px]" data-node-id="4:71">
            <div className="absolute bg-[#49bbbd] h-[34px] left-[calc(41.67%+67px)] rounded-[80px] top-[9485px] w-[100px]" data-node-id="4:72" />
            <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(41.67%+93px)] not-italic text-[18px] text-white top-[9489px] tracking-[0.36px] whitespace-nowrap" data-node-id="4:73">
              NEWS
            </p>
          </div>
        </div>
        <div className="absolute contents left-[calc(33.33%+67px)] top-[9589px]" data-node-id="4:74">
          <div className="absolute contents left-[calc(33.33%+67px)] top-[9589px]" data-node-id="4:75">
            <div className="absolute h-[200px] left-[calc(33.33%+67px)] rounded-[20px] top-[9589px] w-[280px]" data-node-id="4:76">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[20px]">
                <img alt="" className="absolute max-w-none object-cover rounded-[20px] size-full" src={imgRectangle37} />
                <img alt="" className="absolute max-w-none object-cover rounded-[20px] size-full" src={imgRectangle37} />
              </div>
            </div>
            <div className="absolute bg-[#171b41] h-[200px] left-[calc(33.33%+67px)] opacity-10 rounded-[20px] top-[9589px] w-[280px]" data-node-id="4:77" />
          </div>
          <div className="absolute contents left-[calc(41.67%+67px)] top-[9735px]" data-node-id="4:78">
            <div className="absolute bg-[#49bbbd] h-[34px] left-[calc(41.67%+67px)] rounded-[80px] top-[9735px] w-[100px]" data-node-id="4:79" />
            <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(41.67%+93px)] not-italic text-[18px] text-white top-[9739px] tracking-[0.36px] whitespace-nowrap" data-node-id="4:80">
              NEWS
            </p>
          </div>
        </div>
      </div>
      <div className="absolute contents left-0 top-[-1px]" data-node-id="4:81" data-name="Header">
        <div className="absolute contents left-0 top-[-1px]" data-node-id="4:82" data-name="header-bg">
          <div className="absolute h-[1118px] left-0 top-[-1px] w-[1920px]" data-node-id="4:83" data-name="header-pic">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHeaderPic} />
          </div>
        </div>
      </div>
      <div className="absolute h-[59px] right-[116px] top-[38px] w-[82px]" data-node-id="4:143" data-name="Layer 2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLayer21} />
      </div>
      <p className="absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] not-italic right-[calc(8.33%+67px)] text-[#1b3c8a] text-[24px] text-right top-[51px] whitespace-nowrap" dir="auto" data-node-id="4:161">
        نامدارآکادمی
      </p>
      <div className="absolute contents right-[-65px] top-[3867px]" data-node-id="4:90" data-name="Explore Course">
        <div className="absolute flex h-[938px] items-center justify-center right-[-65px] top-[3867px] w-[1507px]">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="bg-[#9dccff] h-[938px] opacity-20 rounded-br-[100px] w-[1507px]" data-node-id="4:91" data-name="Rectangle" />
          </div>
        </div>
        <div className="absolute contents left-[115px] top-[4103px]" data-node-id="4:92" data-name="Category">
          <div className="absolute bg-black h-[82.296px] left-[115px] opacity-5 rounded-[29.5px] top-[4608px] w-[1682.724px]" data-node-id="4:93" data-name="Rectangle" />
          <div className="absolute flex h-[420.172px] items-center justify-center left-[calc(41.67%+88.06px)] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:94" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:95;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:95;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#2196f3] inset-[11.67%_19.88%_12%_20.12%] rounded-[24px]" data-node-id="4:96" data-name="Rectangle" />
                <div className="-translate-x-1/2 absolute flex h-[259.602px] items-center justify-center left-[calc(50%-0.56px)] top-[calc(50%-129.76px)] w-[38.974px]">
                  <div className="-rotate-90 flex-none">
                    <p className="font-['Yekan_Bakh:Medium',sans-serif] h-[38.974px] leading-[normal] not-italic relative text-[24px] text-center text-white w-[259.602px]" dir="auto" data-node-id="4:97">
                      دوره روانشناسی معاملات
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[420.172px] items-center justify-center left-[calc(50%+62px)] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:98" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:99;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:99;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#00cbb8] inset-[12%_20.12%_11.67%_19.88%] rounded-[24px]" data-node-id="4:100" data-name="Rectangle" />
                <div className="absolute flex h-[191px] items-center justify-center left-[31.33%] right-[31.33%] top-[calc(50%-95.21px)]" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[92.5176cqw] w-[99.6624cqh]">
                    <p className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-[24px] text-center text-white" dir="auto" data-node-id="4:101">
                      دوره تکنوفاند
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[420.172px] items-center justify-center right-[calc(25%+172.7px)] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:102" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:103;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:103;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#545ae8] inset-[13.7%_19.96%_9.97%_20.04%] rounded-[24px]" data-node-id="4:104" data-name="Rectangle" />
                <div className="absolute flex h-[193px] items-center justify-center left-[31.26%] right-[31.41%] top-[calc(50%-90.63px)]" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[92.445cqw] w-[99.666cqh]">
                    <p className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-[24px] text-center text-white" dir="auto" data-node-id="4:105">
                      دوره اکوجامع
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[420.172px] items-center justify-center right-[calc(25%+38.7px)] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:106" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:107;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:107;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#435fae] inset-[11.67%_19.88%_12%_20.12%] rounded-[24px]" data-node-id="4:108" data-name="Rectangle" />
                <div className="absolute flex h-[154px] items-center justify-center left-[31.33%] right-[31.33%] top-[calc(50%-77.21px)]" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[93.8809cqw] w-[99.5783cqh]">
                    <p className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-[24px] text-center text-white" dir="auto" data-node-id="4:109">
                      دوره پیش بینی
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[420.172px] items-center justify-center right-[calc(16.67%+64.7px)] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:110" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:111;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:111;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#545ae8] inset-[12.98%_20.81%_10.68%_19.19%] rounded-[24px]" data-node-id="4:112" data-name="Rectangle" />
                <div className="absolute flex h-[199px] items-center justify-center left-[31.91%] right-[30.75%] top-[calc(50%-93.54px)]" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[92.228cqw] w-[99.6764cqh]">
                    <p className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-[24px] text-center text-white" dir="auto" data-node-id="4:113">
                      دوره اقتصاد کلان
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[420.172px] items-center justify-center right-[calc(8.33%+90.7px)] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:114" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:115;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:115;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#00a8ff] inset-[11.67%_19.88%_12%_20.12%] rounded-[24px]" data-node-id="4:116" data-name="Rectangle" />
                <div className="absolute flex h-[125px] items-center justify-center left-[31.33%] right-[31.33%] top-[calc(50%-62.71px)]" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[94.9778cqw] w-[99.4779cqh]">
                    <p className="font-['Roboto:Medium','Noto_Sans_Arabic:Regular',sans-serif] font-medium leading-[normal] relative size-full text-[24px] text-center text-white" dir="auto" data-node-id="4:117" style={{ fontVariationSettings: "'wdth' 100" }}>
                      دوره تکنیکال
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[420.172px] items-center justify-center right-[116.7px] top-[4229.9px] w-[111.297px]">
            <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">
              <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:118" data-name="Book">
                <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:119;0:1642" data-name="Rectangle" />
                <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:119;0:1643" data-name="Rectangle" />
                <div className="absolute bg-[#0eaf77] inset-[14.35%_20.42%_9.31%_19.58%] rounded-[24px]" data-node-id="4:120" data-name="Rectangle" />
                <div className="absolute flex h-[208px] items-center justify-center left-[31.68%] right-[30.98%] top-[calc(50%-97.06px)]" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[91.9044cqw] w-[99.691cqh]">
                    <p className="font-['Roboto:Medium','Noto_Sans_Arabic:Regular',sans-serif] font-medium leading-[normal] relative size-full text-[24px] text-center text-white" dir="auto" data-node-id="4:121" style={{ fontVariationSettings: "'wdth' 100" }}>
                      دوره lq1
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute h-[429.612px] left-[181px] top-[4225px] w-[684.781px]" data-node-id="4:122" data-name="Detail">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDetail} />
          </div>
          <div className="absolute flex h-[39.056px] items-center justify-center left-[128px] top-[4103px] w-[171.195px]">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="h-[39.056px] relative w-[171.195px]" data-node-id="4:123" data-name="Button/SeeAll">
                <div className="absolute contents inset-[7.14%_0_10.71%_81.3%]" data-node-id="I4:123;0:1638" data-name="android-arrow-forward">
                  <div className="absolute inset-[7.14%_0_10.71%_81.3%]" data-node-id="I4:123;0:1639" data-name="Icon_8_">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon8} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] left-[237.5px] not-italic text-[#1b3c8a] text-[24px] text-center top-[4105px] whitespace-nowrap" dir="auto" data-node-id="4:124">
            نمایش بیشتر
          </p>
        </div>
      </div>
      <div className="absolute contents left-[174px] top-[1533px]" data-node-id="4:125" data-name="Our Success">
        <div className="absolute content-stretch flex gap-[95px] items-start left-[174px] not-italic top-[1533px] whitespace-nowrap" data-node-id="4:126">
          <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="4:127">
            <p className="bg-clip-text bg-gradient-to-r font-['Buenos_Aires_Trial:Light',sans-serif] from-[#136cb5] leading-none relative shrink-0 text-[96px] text-[transparent] to-[#49bbbd]" data-node-id="4:128">
              15K+
            </p>
            <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.3] relative shrink-0 text-[32px] text-[rgba(1,5,20,0.8)]" dir="auto" data-node-id="4:129">
              دانش پذیر
            </p>
          </div>
          <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="4:130">
            <p className="bg-clip-text bg-gradient-to-r font-['Poppins:Light',sans-serif] from-[#136cb5] leading-[0] relative shrink-0 text-[96px] text-[transparent] to-[#49bbbd]" data-node-id="4:131">
              <span className="font-['Buenos_Aires_Trial:Light',sans-serif] leading-none">75</span>
              <span className="font-['Buenos_Aires_Trial:Light',sans-serif] leading-none tracking-[-20px]">{` `}</span>
              <span className="font-['Buenos_Aires_Trial:Light',sans-serif] leading-none">%</span>
            </p>
            <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.3] relative shrink-0 text-[32px] text-[rgba(1,5,20,0.8)]" dir="auto" data-node-id="4:132">
              موفقیت در ترید
            </p>
          </div>
          <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="4:133">
            <p className="bg-clip-text bg-gradient-to-r font-['Buenos_Aires_Trial:Light',sans-serif] from-[#136cb5] leading-none relative shrink-0 text-[96px] text-[transparent] to-[#49bbbd]" data-node-id="4:134">
              35
            </p>
            <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.3] relative shrink-0 text-[32px] text-[rgba(1,5,20,0.8)]" dir="auto" data-node-id="4:135">
              دوره آموزشی حضوری و غیر حضوری
            </p>
          </div>
          <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="4:136">
            <p className="bg-clip-text bg-gradient-to-r font-['Buenos_Aires_Trial:Light',sans-serif] from-[#136cb5] leading-none relative shrink-0 text-[96px] text-[transparent] to-[#49bbbd]" data-node-id="4:137">
              26
            </p>
            <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.3] relative shrink-0 text-[32px] text-[rgba(1,5,20,0.8)]" dir="auto" data-node-id="4:138">
              تجربه منتورینگ
            </p>
          </div>
          <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="4:139">
            <p className="bg-clip-text bg-gradient-to-r font-['Buenos_Aires_Trial:Light',sans-serif] from-[#136cb5] leading-none relative shrink-0 text-[96px] text-[transparent] to-[#49bbbd]" data-node-id="4:140">
              16
            </p>
            <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.3] relative shrink-0 text-[32px] text-[rgba(1,5,20,0.8)]" dir="auto" data-node-id="4:141">
              سال تجربه آموزش
            </p>
          </div>
        </div>
      </div>
      <div className="absolute contents left-[9px] right-[-9px] top-[-1px]" data-node-id="4:146" data-name="Mask group">
        <div className="absolute aspect-[4096/2731] left-[-146px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[155px_52px] mask-size-[1920px_1118px] right-[-164px] top-[-53px]" data-node-id="4:158" style={{ maskImage: `url('${imgLayer02}')` }} data-name="Layer 0 2">
          <img alt="" className="absolute inset-0 max-w-none object-cover opacity-5 pointer-events-none size-full" src={imgLayer3} />
        </div>
        <div className="absolute h-[931px] left-[-66px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[66px_-123px] mask-size-[1920px_1118px] top-[122px] w-[970px]" data-node-id="4:159" style={{ maskImage: `url('${imgLayer02}')` }}>
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgF7Eff535B0Ed407AA6C3E4D475E4Fc741}
            style={{
              maskImage: "linear-gradient(to bottom, black 70%, transparent 96%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 96%)",
            }}
          />
        </div>
      </div>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[0] left-[calc(16.67%+1194px)] not-italic text-[#06142f] text-[48px] text-right top-[1212px] whitespace-nowrap" dir="auto" data-node-id="4:160">
        <span className="leading-[normal]">{`مرجع آموزش ترید و سرمایه گذاری با بیش از `}</span>
        <span className="font-['Yekan_Bakh:Heavy',sans-serif] leading-[normal]">یک میلیون</span>
        <span className="leading-[normal]">{` کاربر فعال`}</span>
      </p>
      {/* Brand circles — temporarily hidden. Flip SHOW_BRAND_CIRCLES to true to re-enable. */}
      {(() => {
        const SHOW_BRAND_CIRCLES = false;
        if (!SHOW_BRAND_CIRCLES) return null;
        const ROW_TOP = 560;
        const HALO_SIZE = 120;
        const LOGO_SIZE = 96;
        const LOGO_OFFSET = (HALO_SIZE - LOGO_SIZE) / 2;
        const GAP = 95;
        const RIGHT_EDGE = 1490;
        // RTL order: MON first (rightmost), then NOVA, LQ1, FINVEST
        // FINVEST source PNG is wider than tall with the circle on the left half,
        // so it needs special crop styling to match the others visually.
        const circles = [
          { img: imgImage1, bg: "radial-gradient(circle, rgba(255,176,75,0.55) 0%, rgba(255,176,75,0) 75%)", mon: true },
          { img: imgUntitled1Copy1, bg: "radial-gradient(circle, rgba(66,71,186,0.55) 0%, rgba(66,71,186,0) 75%)" },
          { img: imgLayer11, bg: "radial-gradient(circle, rgba(12,156,75,0.55) 0%, rgba(12,156,75,0) 75%)" },
          { img: imgFinvestCopy1, bg: "radial-gradient(circle, rgba(18,18,18,0.45) 0%, rgba(18,18,18,0) 75%)", finvest: true },
        ];
        return circles.map((c, i) => {
          const left = RIGHT_EDGE - HALO_SIZE - i * (HALO_SIZE + GAP);
          return (
            <div key={i}>
              <div
                className="absolute rounded-full"
                style={{
                  left,
                  top: ROW_TOP,
                  width: HALO_SIZE,
                  height: HALO_SIZE,
                  background: c.bg,
                }}
              />
              <div
                className="absolute rounded-full overflow-hidden pointer-events-none"
                style={{
                  left: left + LOGO_OFFSET,
                  top: ROW_TOP + LOGO_OFFSET,
                  width: LOGO_SIZE,
                  height: LOGO_SIZE,
                }}
              >
                {c.finvest ? (
                  <img
                    alt=""
                    className="absolute"
                    style={{ left: -36, top: -20, width: 252, height: 125, maxWidth: "none" }}
                    src={c.img}
                  />
                ) : c.mon ? (
                  // MON source PNG has "STUDENT REVIEWS" text under the sphere;
                  // render taller than the wrapper and clip bottom via overflow-hidden.
                  <img
                    alt=""
                    className="absolute"
                    style={{ left: 0, top: 0, width: 96, height: 141, maxWidth: "none" }}
                    src={c.img}
                  />
                ) : (
                  <img
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                    src={c.img}
                  />
                )}
              </div>
            </div>
          );
        });
      })()}
      {/* decorative ring kept near photo */}
      <div className="absolute left-[300px] size-[120px] top-[540px]" data-node-id="4:165">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse2913} />
      </div>
      {/* Search bar + category pills — temporarily hidden. Flip SHOW_SEARCH to true to re-enable. */}
      {(() => {
        const SHOW_SEARCH = false;
        if (!SHOW_SEARCH) return null;
        return (
          <>
            <div className="absolute backdrop-blur-[5.15px] bg-[rgba(217,217,217,0.31)] border border-solid border-white h-[64px] left-[calc(16.67%+254px)] rounded-[64px] top-[600px] w-[916px]" data-node-id="4:177" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[50px] left-[calc(58.33%+303px)] not-italic text-[#aeb6b6] text-[18px] text-right top-[607px] whitespace-nowrap" dir="auto" data-node-id="4:179">
              دوره مورد نظر خود را جستجو کن
            </p>
            <div className="absolute bg-[#1b3c8a] border border-solid border-white h-[64px] left-[calc(16.67%+255px)] rounded-bl-[40px] rounded-tl-[40px] top-[600px] w-[150px]" data-node-id="4:180" />
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(66.67%+84.28px)] rounded-[6px] top-[672px] w-[125.704px]" data-node-id="4:182" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(58.33%+334px)] not-italic text-[17px] text-right text-white top-[653px] w-[117px]" dir="auto" data-node-id="4:184">
              تکنیکال
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(58.33%+112.66px)] rounded-[6px] top-[672px] w-[125.704px]" data-node-id="4:185" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(58.33%+211px)] not-italic text-[17px] text-right text-white top-[653px] w-[87px]" dir="auto" data-node-id="4:186">
              فاندامنتال
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(25%+204px)] rounded-[6px] top-[672px] w-[125.704px]" data-node-id="4:187" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(25%+305px)] not-italic text-[17px] text-right text-white top-[654px] w-[93px]" dir="auto" data-node-id="4:188">
              فاندامنتال
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(33.33%+175.62px)] rounded-[6px] top-[672px] w-[260.282px]" data-node-id="4:189" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(33.33%+411px)] not-italic text-[17px] text-right text-white top-[654px] w-[253px]" dir="auto" data-node-id="4:190">
              موضوعات روانشناسی معاملات
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(50%+197.24px)] rounded-[6px] top-[672px] w-[69.507px]" data-node-id="4:191" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(50%+244px)] not-italic text-[17px] text-right text-white top-[653px] w-[45px]" dir="auto" data-node-id="4:192">
              طلا
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(50%+121.82px)] rounded-[6px] top-[672px] w-[69.507px]" data-node-id="4:193" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(50%+166px)] not-italic text-[17px] text-right text-white top-[653px] w-[46px]" dir="auto" data-node-id="4:194">
              دلار
            </p>
          </>
        );
      })()}
      <div className="absolute contents left-[calc(33.33%+61px)] top-[1352px]" data-node-id="4:195">
        <div className="absolute bg-[#1b3c8a] h-[101px] left-[calc(33.33%+61px)] rounded-[82px] top-[1352px] w-[516px]" data-node-id="4:196" />
        <p className="absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] left-[calc(41.67%+32px)] not-italic text-[32px] text-white top-[1377px] whitespace-nowrap" dir="auto" data-node-id="4:197">
          درخواست ثبت مشاوره
        </p>
      </div>
      <div className="absolute contents left-[calc(8.33%+73px)] top-[3251px]" data-node-id="4:198" data-name="All-in-one">
        <div className="absolute bg-white h-[430px] left-[calc(8.33%+73px)] rounded-[20px] shadow-[0px_10px_60px_0px_rgba(38,45,118,0.08)] top-[3315px] w-[450px]" data-node-id="4:199" />
        <div className="absolute bg-white h-[430px] left-[calc(33.33%+103px)] rounded-[20px] shadow-[0px_10px_60px_0px_rgba(38,45,118,0.08)] top-[3315px] w-[450px]" data-node-id="4:200" />
        <div className="absolute bg-white h-[430px] left-[calc(66.67%-27px)] rounded-[20px] shadow-[0px_10px_60px_0px_rgba(38,45,118,0.08)] top-[3315px] w-[450px]" data-node-id="4:201" />
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(8.33%+298.5px)] not-italic text-[#444] text-[30px] text-center top-[3420px] w-[343px]" dir="auto" data-node-id="4:202">
          اطلاعات موفقیت ها
        </p>
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(33.33%+327.5px)] not-italic text-[#444] text-[30px] text-center top-[3420px] w-[345px]" dir="auto" data-node-id="4:203">
          اطلاعات هفته های آموزشی
        </p>
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(66.67%+198.5px)] not-italic text-[#444] text-[30px] text-center top-[3420px] whitespace-nowrap" dir="auto" data-node-id="4:204">
          اطلاعات سرفصل ها
        </p>
        <div className="-translate-x-1/2 absolute font-['Yekan_Bakh:Regular',sans-serif] leading-[0] left-[calc(66.67%+198.5px)] not-italic text-[#696984] text-[20px] text-center top-[3515px] w-[319px] whitespace-pre-wrap" data-node-id="4:205">
          <p className="leading-[1.8] mb-0" dir="auto">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="leading-[1.8] mb-0" dir="auto">
            ​
          </p>
          <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.8]" dir="auto">{`بیشتر بدانیم   >`}</p>
        </div>
        <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] leading-[1.8] left-[calc(41.67%+998px)] not-italic text-[#696984] text-[30px] text-right top-[4096px] w-[971px]" dir="auto" data-node-id="4:206">
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
        </p>
        <div className="-translate-x-1/2 absolute font-['Yekan_Bakh:Regular',sans-serif] leading-[0] left-[calc(41.67%+171.5px)] not-italic text-[#696984] text-[20px] text-center top-[3515px] w-[319px] whitespace-pre-wrap" data-node-id="4:207">
          <p className="leading-[1.8] mb-0" dir="auto">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="leading-[1.8] mb-0" dir="auto">
            ​
          </p>
          <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.8]" dir="auto">{`بیشتر بدانیم   >`}</p>
        </div>
        <div className="-translate-x-1/2 absolute font-['Yekan_Bakh:Regular',sans-serif] leading-[0] left-[calc(8.33%+298.5px)] not-italic text-[#696984] text-[20px] text-center top-[3515px] w-[319px] whitespace-pre-wrap" data-node-id="4:208">
          <p className="leading-[1.8] mb-0" dir="auto">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
          </p>
          <p className="leading-[1.8] mb-0" dir="auto">
            ​
          </p>
          <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.8]" dir="auto">{`بیشتر بدانیم   >`}</p>
        </div>
        <div className="absolute contents left-[calc(41.67%+118px)] top-[3258px]" data-node-id="4:209">
          <div className="absolute left-[calc(41.67%+118px)] size-[100px] top-[3258px]" data-node-id="4:210">
            <div className="absolute inset-[-24%_-40%_-56%_-40%]">
              <img alt="" className="block max-w-none size-full" src={imgEllipse6} />
            </div>
          </div>
          <div className="absolute left-[calc(41.67%+144px)] overflow-clip size-[48px] top-[3284px]" data-node-id="4:211" data-name="calendar 2">
            <div className="absolute contents inset-[0_71.43%_89.29%_21.43%]" data-node-id="4:212" data-name="Group">
              <div className="absolute inset-[0_71.43%_89.29%_21.43%]" data-node-id="4:213" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
              </div>
            </div>
            <div className="absolute contents inset-[0_21.43%_89.29%_71.43%]" data-node-id="4:215" data-name="Group">
              <div className="absolute inset-[0_21.43%_89.29%_71.43%]" data-node-id="4:216" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
              </div>
            </div>
            <div className="absolute contents inset-[10.71%_0_0_0]" data-node-id="4:218" data-name="Group">
              <div className="absolute inset-[10.71%_0_0_0]" data-node-id="4:219" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup2} />
              </div>
            </div>
            <div className="absolute bottom-[42.86%] contents left-[17.86%] right-[67.86%] top-1/2" data-node-id="4:221" data-name="Group">
              <div className="absolute bottom-[42.86%] left-[17.86%] right-[67.86%] top-1/2" data-node-id="4:222" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup3} />
              </div>
            </div>
            <div className="absolute bottom-[42.86%] contents left-[42.86%] right-[42.86%] top-1/2" data-node-id="4:224" data-name="Group">
              <div className="absolute bottom-[42.86%] left-[42.86%] right-[42.86%] top-1/2" data-node-id="4:225" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup4} />
              </div>
            </div>
            <div className="absolute bottom-[42.86%] contents left-[67.86%] right-[17.86%] top-1/2" data-node-id="4:227" data-name="Group">
              <div className="absolute bottom-[42.86%] left-[67.86%] right-[17.86%] top-1/2" data-node-id="4:228" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup5} />
              </div>
            </div>
            <div className="absolute contents inset-[64.29%_67.86%_28.57%_17.86%]" data-node-id="4:230" data-name="Group">
              <div className="absolute inset-[64.29%_67.86%_28.57%_17.86%]" data-node-id="4:231" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup6} />
              </div>
            </div>
            <div className="absolute contents inset-[64.29%_42.86%_28.57%_42.86%]" data-node-id="4:233" data-name="Group">
              <div className="absolute inset-[64.29%_42.86%_28.57%_42.86%]" data-node-id="4:234" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup7} />
              </div>
            </div>
            <div className="absolute contents inset-[64.29%_17.86%_28.57%_67.86%]" data-node-id="4:236" data-name="Group">
              <div className="absolute inset-[64.29%_17.86%_28.57%_67.86%]" data-node-id="4:237" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
              </div>
            </div>
            <div className="absolute contents inset-[78.57%_67.86%_14.29%_17.86%]" data-node-id="4:239" data-name="Group">
              <div className="absolute inset-[78.57%_67.86%_14.29%_17.86%]" data-node-id="4:240" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup9} />
              </div>
            </div>
            <div className="absolute contents inset-[78.57%_42.86%_14.29%_42.86%]" data-node-id="4:242" data-name="Group">
              <div className="absolute inset-[78.57%_42.86%_14.29%_42.86%]" data-node-id="4:243" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup10} />
              </div>
            </div>
            <div className="absolute contents inset-[78.57%_17.86%_14.29%_67.86%]" data-node-id="4:245" data-name="Group">
              <div className="absolute inset-[78.57%_17.86%_14.29%_67.86%]" data-node-id="4:246" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup11} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute left-[calc(75%-12px)] size-[100px] top-[3258px]" data-node-id="4:248">
          <div className="absolute inset-[-30%_-40%_-50%_-40%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup81} />
          </div>
        </div>
        <div className="absolute left-[calc(16.67%+88px)] size-[100px] top-[3258px]" data-node-id="4:252">
          <div className="absolute inset-[-30%_-40%_-50%_-40%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup79} />
          </div>
        </div>
        <div className="absolute right-[calc(41.67%+98px)] size-[114px] top-[3251px]" data-node-id="4:256" data-name="image 2">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[146.59%] left-0 max-w-none top-0 w-[99.87%]" src={imgImage1} />
          </div>
        </div>
        <div className="absolute left-[calc(16.67%+81px)] size-[114px] top-[3251px]" data-node-id="4:257" data-name="image 3">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[146.59%] left-0 max-w-none top-0 w-[99.87%]" src={imgImage1} />
          </div>
        </div>
      </div>
      <div className="absolute right-[calc(16.67%+58px)] size-[114px] top-[3251px]" data-node-id="4:258" data-name="image 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[146.59%] left-0 max-w-none top-0 w-[99.87%]" src={imgImage1} />
        </div>
      </div>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(41.67%+998px)] not-italic text-[#081738] text-[45px] text-right top-[4004px] w-[893px]" dir="auto" data-node-id="4:259">
        دوره های غیر حضوری
      </p>
      <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(50%-2.5px)] not-italic text-[#081738] text-[45px] text-center top-[4916px] w-[893px]" dir="auto" data-node-id="4:260">
        خدمات سرمایه گذاری مطمین
      </p>
      <div className="absolute contents left-[175px] top-[4225px]" data-node-id="4:261">
        <div className="absolute bg-white border border-[rgba(0,0,0,0.3)] border-solid h-[432px] left-[175px] rounded-[25px] top-[4225px] w-[691px]" data-node-id="4:262" />
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[37.206px] leading-[1.8] left-[calc(8.33%+217px)] not-italic text-[#00cbb8] text-[20px] text-center top-[4565.02px] w-[208px] whitespace-pre-wrap" dir="auto" data-node-id="4:263">{`خرید دوره   ۲۴،۰۰۰،۰۰۰ تومان`}</p>
        <div className="absolute h-[352.699px] left-[calc(25%+87.81px)] rounded-[34px] top-[4265.13px] w-[268.433px]" data-node-id="4:264" data-name="lq1 banner copy 1">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[34px]">
            <img alt="" className="absolute h-[100.03%] left-[-38.58%] max-w-none top-[-0.02%] w-[323.3%]" src={imgLq1BannerCopy1} />
          </div>
        </div>
        <div className="absolute border-2 border-[#00cbb8] border-solid h-[73.378px] left-[220px] rounded-[63px] top-[4547.45px] w-[315px]" data-node-id="4:265" />
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[48.574px] leading-[normal] left-[calc(8.33%+256.5px)] not-italic text-[#1b3c8a] text-[30px] text-center top-[4280.81px] w-[343px]" dir="auto" data-node-id="4:266">
          دوره آموزشی LQ1
        </p>
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[23.77px] leading-[normal] left-[calc(8.33%+300.5px)] not-italic text-[#444] text-[15px] text-center top-[4335.58px] w-[343px]" dir="auto" data-node-id="4:267">
          سطح دوره پیشرفته
        </p>
        <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[109.55px] leading-[1.65] left-[510px] not-italic text-[#696984] text-[20px] text-right top-[4382.09px] w-[310px]" dir="auto" data-node-id="4:268">
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
        </p>
        <div className="absolute h-[24.804px] left-[calc(16.67%+166px)] top-[4501.98px] w-[24px]" data-node-id="4:269">
          <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
            <img alt="" className="block max-w-none size-full" src={imgStar8} />
          </div>
        </div>
        <div className="absolute h-[24.804px] left-[calc(16.67%+141px)] top-[4501.98px] w-[24px]" data-node-id="4:270">
          <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
            <img alt="" className="block max-w-none size-full" src={imgStar8} />
          </div>
        </div>
        <div className="absolute h-[24.804px] left-[calc(16.67%+117px)] top-[4501.98px] w-[24px]" data-node-id="4:271">
          <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
            <img alt="" className="block max-w-none size-full" src={imgStar8} />
          </div>
        </div>
        <div className="absolute h-[24.804px] left-[calc(16.67%+92px)] top-[4501.98px] w-[24px]" data-node-id="4:272">
          <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
            <img alt="" className="block max-w-none size-full" src={imgStar8} />
          </div>
        </div>
        <div className="absolute h-[24.804px] left-[calc(16.67%+67px)] top-[4501.98px] w-[24px]" data-node-id="4:273">
          <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
            <img alt="" className="block max-w-none size-full" src={imgStar12} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-[181px] top-[5229px]" data-node-id="4:274" data-name="What Is TOTC">
        <div className="absolute contents left-[181px] top-[5229px]" data-node-id="4:275">
          <div className="absolute h-[477.789px] left-[181px] rounded-[20px] top-[5232.58px] w-[716.683px]" data-node-id="4:276">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle19} />
          </div>
          <div className="absolute h-[477.789px] left-[181px] top-[5229px] w-[716.683px]" data-node-id="4:277">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle22} />
          </div>
        </div>
        <div className="absolute contents left-[calc(50%+57.13px)] top-[5232.58px]" data-node-id="4:278">
          <div className="absolute bg-[#c4c4c4] h-[477.789px] left-[calc(50%+57.13px)] rounded-[20px] top-[5232.58px] w-[716.683px]" data-node-id="4:279" />
          <div className="absolute h-[477.789px] left-[calc(50%+57.13px)] rounded-[20px] top-[5232.58px] w-[716.683px]" data-node-id="4:280">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle21} />
          </div>
          <div className="absolute bg-[rgba(23,27,65,0.45)] h-[477.789px] left-[calc(50%+57.13px)] opacity-60 rounded-[20px] top-[5232.58px] w-[716.683px]" data-node-id="4:281" />
        </div>
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[57.335px] leading-[normal] left-[calc(8.33%+379.34px)] not-italic text-[32px] text-center text-white top-[5390.25px] w-[348.786px]" dir="auto" data-node-id="4:282">
          دستیار معامله گری فینوست
        </p>
        <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[57.335px] leading-[normal] left-[calc(58.33%+255.47px)] not-italic text-[32px] text-center text-white top-[5390.25px] w-[277.117px]" dir="auto" data-node-id="4:283">
          مشاوره سبدچینی نوا
        </p>
        <div className="absolute contents left-[calc(16.67%+50.92px)] top-[5467.89px]" data-node-id="4:284">
          <div className="absolute border border-solid border-white h-[95.558px] left-[calc(16.67%+50.92px)] rounded-[80px] top-[5467.89px] w-[338.035px]" data-node-id="4:285" />
          <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Medium',sans-serif] h-[39.418px] leading-[normal] left-[calc(16.67%+219.34px)] not-italic text-[22px] text-center text-white top-[5496.56px] w-[248.45px]" dir="auto" data-node-id="4:286">
            اطلاعات بیشتر
          </p>
        </div>
        <div className="absolute contents left-[calc(58.33%+87.05px)] top-[5467.89px]" data-node-id="4:287">
          <div className="absolute bg-[rgba(160,35,238,0.9)] h-[95.558px] left-[calc(58.33%+87.05px)] rounded-[80px] top-[5467.89px] w-[338.035px]" data-node-id="4:288" />
          <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Medium',sans-serif] h-[39.418px] leading-[normal] left-[calc(66.67%+95.47px)] not-italic text-[24px] text-center text-white top-[5496.56px] w-[241.283px]" dir="auto" data-node-id="4:289">
            درخواست مشاوره
          </p>
        </div>
      </div>
      <MonCoachingSection videoSrc={monVideoUrl} poster={monPosterUrl} />
      <div className="absolute bg-black h-[329px] left-[-11px] top-[1892px] w-[1929px]" data-node-id="4:291" />
      <div className="absolute contents left-[-11px] top-[1892px]" data-node-id="4:292" data-name="Mask group">
        <div className="absolute contents left-[-68px] top-[1690.67px]" data-node-id="4:294">
          <div className="absolute h-[817.651px] left-[-68px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[57px_201.326px] mask-size-[1929px_329px] top-[1690.67px] w-[1226px]" data-node-id="4:296" style={{ maskImage: `url('${img1072Copy2}')` }} data-name="1072 copy 2">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1072Copy3} />
          </div>
        </div>
      </div>
      <div className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[0] left-[calc(58.33%+675px)] not-italic text-[#fefeff] text-[0px] text-right top-[2011px] w-[605px] whitespace-pre-wrap" data-node-id="4:297">
        <p className="leading-[normal] mb-0 text-[64px]" dir="auto">{`دوره پیشرفته MON `}</p>
        <p className="leading-[normal] text-[40px]" dir="auto">
          با تدریس استاد امیرحسین نام آور
        </p>
      </div>
      <div className="absolute h-[329px] left-[calc(25%+134px)] mix-blend-luminosity top-[1892px] w-[979px]" data-node-id="4:298" data-name="TT6A9115 copy 2">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[333.13%] left-[-0.02%] max-w-none top-[-37.08%] w-[100.05%]" src={imgTt6A9115Copy2} />
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular','Noto_Sans_Arabic:Regular',sans-serif] h-[243px] leading-[1.8] left-[calc(8.33%+797.5px)] text-[24px] text-black text-center top-[5013px] tracking-[0.48px] w-[1443px]" dir="auto" data-node-id="4:299" style={{ fontVariationSettings: "'wdth' 100, 'wght' 400" }}>{`لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری `}</p>
      <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[611.5px] not-italic text-[#081738] text-[45px] text-center top-[5937px] w-[893px]" dir="auto" data-node-id="4:300">
        جلسات مشاوره آنلاین سبدچینی
      </p>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[341px] leading-[1.8] left-[859px] not-italic text-[24px] text-black text-right top-[6034px] tracking-[0.48px] w-[667px]" dir="auto" data-node-id="4:301">
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد،
      </p>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(33.33%+986px)] not-italic text-[#081738] text-[45px] text-right top-[6616px] w-[893px]" dir="auto" data-node-id="4:302">
        سیگنال معاملاتی در خصوص طلا
      </p>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[341px] leading-[1.8] left-[calc(50%+666px)] not-italic text-[24px] text-black text-right top-[6712px] tracking-[0.48px] w-[667px]" dir="auto" data-node-id="4:303">
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد،
      </p>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[875px] not-italic text-[#081738] text-[45px] text-right top-[7239px] w-[893px]" dir="auto" data-node-id="4:304">
        مشاوره و پشتیبانی ۲۴ ساعته
      </p>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[341px] leading-[1.8] left-[875px] not-italic text-[24px] text-black text-right top-[7335px] tracking-[0.48px] w-[667px]" dir="auto" data-node-id="4:305">
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد،
      </p>
      <div className="absolute contents left-[calc(41.67%+116px)] top-[5848px]" data-node-id="4:306">
        <div className="absolute left-[calc(75%-13.88px)] size-[221.866px] top-[6172.4px]" data-node-id="4:307">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse19} />
        </div>
        <div className="absolute left-[calc(75%-38.25px)] size-[25.212px] top-[6350.56px]" data-node-id="4:308">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse20} />
        </div>
        <div className="absolute left-[calc(58.33%-16.59px)] size-[25.212px] top-[5854.72px]" data-node-id="4:309">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse21} />
        </div>
        <div className="absolute left-[calc(50%+8.95px)] size-[117.656px] top-[5848px]" data-node-id="4:310">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse22} />
        </div>
        <div className="absolute contents left-[calc(41.67%+116px)] top-[5911.87px]" data-node-id="4:311">
          <div className="absolute h-[405.914px] left-[calc(41.67%+116px)] top-[5911.87px] w-[658.035px]" data-node-id="4:312">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup67} />
          </div>
          <div className="absolute contents left-[calc(50%+10px)] top-[6226px]" data-node-id="4:318">
            <div className="absolute bg-[#e4d4ff] h-[55px] left-[calc(50%+10px)] rounded-[51.068px] top-[6226px] w-[242px]" data-node-id="4:319" />
            <div className="absolute bg-[#a534e1] h-[43px] left-[calc(50%+21px)] rounded-[51.068px] shadow-[0px_8.511px_20.427px_0px_rgba(202,47,93,0.3)] top-[6232px] w-[219px]" data-node-id="4:320" />
            <div className="absolute left-[calc(58.33%+25.06px)] size-[14.306px] top-[6246.35px]" data-node-id="4:321" data-name="phone 1" />
          </div>
          <div className="absolute contents left-[calc(50%+26.47px)] top-[5989.84px]" data-node-id="4:322">
            <div className="absolute contents left-[calc(50%+35.06px)] top-[6012.01px]" data-node-id="4:323" data-name="Mask Group">
              <div className="absolute h-[190.839px] left-[calc(50%+2.81px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[32.246px_0px] mask-size-[197.419px_190.839px] rounded-[17.023px] top-[6012.01px] w-[284.942px]" data-node-id="4:325" style={{ maskImage: `url('${imgPortraitTeacherGivingOnlineClass1}')` }} data-name="portrait-teacher-giving-online-class 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[17.023px] size-full" src={imgPortraitTeacherGivingOnlineClass2} />
              </div>
            </div>
            <div className="absolute contents left-[calc(50%+26.47px)] top-[5989.84px]" data-node-id="4:326" data-name="Mask Group">
              <div className="absolute h-[207.434px] left-[calc(50%-8.58px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[35.049px_0px] mask-size-[214.586px_207.434px] rounded-[17.023px] top-[5989.84px] w-[309.72px]" data-node-id="4:328" style={{ maskImage: `url('${imgPortraitTeacherGivingOnlineClass3}')` }} data-name="portrait-teacher-giving-online-class 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[17.023px] size-full" src={imgPortraitTeacherGivingOnlineClass2} />
              </div>
            </div>
            <div className="absolute contents left-[calc(50%+33.32px)] top-[6171.55px]" data-node-id="4:329">
              <div className="absolute backdrop-blur-[5.546px] bg-[rgba(201,211,231,0.4)] h-[18.489px] left-[calc(50%+33.32px)] rounded-[5.546px] top-[6171.55px] w-[142.868px]" data-node-id="4:330" />
              <div className="absolute bg-[#3793ff] h-[13.446px] left-[calc(50%+49.28px)] rounded-[5.546px] top-[6174.08px] w-[48.743px]" data-node-id="4:331" />
              <div className="absolute contents left-[calc(50%+37.98px)] top-[6177.61px]" data-node-id="4:332">
                <div className="absolute bg-white h-[3.262px] left-[calc(50%+37.98px)] rounded-[0.555px] top-[6180.88px] w-[1.398px]" data-node-id="4:333" />
                <div className="absolute bg-white h-[4.894px] left-[calc(50%+40.31px)] rounded-[0.555px] top-[6179.25px] w-[1.398px]" data-node-id="4:334" />
                <div className="absolute bg-white h-[6.525px] left-[calc(50%+42.64px)] rounded-[0.555px] top-[6177.61px] w-[1.398px]" data-node-id="4:335" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(75%+44.95px)] top-[5956.43px]" data-node-id="4:336">
            <div className="absolute contents left-[calc(75%+44.95px)] top-[5956.43px]" data-node-id="4:337" data-name="Mask Group">
              <div className="absolute h-[164.102px] left-[calc(75%+25.15px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[19.805px_0px] mask-size-[169.761px_164.103px] top-[5956.43px] w-[210.504px]" data-node-id="4:339" style={{ maskImage: `url('${imgImage8}')` }} data-name="image 8">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage9} />
              </div>
            </div>
            <div className="absolute contents left-[calc(75%+54.01px)] top-[6089.41px]" data-node-id="4:340">
              <div className="absolute backdrop-blur-[6.733px] bg-[rgba(201,211,231,0.4)] h-[22.069px] left-[calc(75%+54.01px)] rounded-[6.733px] top-[6089.41px] w-[86.012px]" data-node-id="4:341" />
              <div className="absolute contents left-[calc(75%+59.66px)] top-[6096.76px]" data-node-id="4:342">
                <div className="absolute bg-white h-[3.961px] left-[calc(75%+59.66px)] rounded-[0.673px] top-[6100.72px] w-[1.698px]" data-node-id="4:343" />
                <div className="absolute bg-white h-[5.942px] left-[calc(75%+62.49px)] rounded-[0.673px] top-[6098.74px] w-[1.698px]" data-node-id="4:344" />
                <div className="absolute bg-white h-[7.922px] left-[calc(75%+65.32px)] rounded-[0.673px] top-[6096.76px] w-[1.698px]" data-node-id="4:345" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(66.67%+19.02px)] top-[5989.84px]" data-node-id="4:346">
            <div className="absolute contents left-[calc(66.67%+19.02px)] top-[5989.84px]" data-node-id="4:347" data-name="Mask Group">
              <div className="absolute h-[132.364px] left-[calc(66.67%+7.83px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[11.186px_-2.796px] mask-size-[139.821px_135.16px] top-[5992.63px] w-[162.192px]" data-node-id="4:349" style={{ maskImage: `url('${imgImage7}')` }} data-name="image 7">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage10} />
              </div>
            </div>
            <div className="absolute contents left-[calc(66.67%+26.48px)] top-[6099.36px]" data-node-id="4:350">
              <div className="absolute backdrop-blur-[5.546px] bg-[rgba(201,211,231,0.4)] h-[18.177px] left-[calc(66.67%+26.48px)] rounded-[5.546px] top-[6099.36px] w-[81.562px]" data-node-id="4:351" />
              <div className="absolute contents left-[calc(66.67%+31.14px)] top-[6105.42px]" data-node-id="4:352">
                <div className="absolute bg-white h-[3.262px] left-[calc(66.67%+31.14px)] rounded-[0.555px] top-[6108.69px] w-[1.398px]" data-node-id="4:353" />
                <div className="absolute bg-white h-[4.894px] left-[calc(66.67%+33.47px)] rounded-[0.555px] top-[6107.05px] w-[1.398px]" data-node-id="4:354" />
                <div className="absolute bg-white h-[6.525px] left-[calc(66.67%+35.8px)] rounded-[0.555px] top-[6105.42px] w-[1.398px]" data-node-id="4:355" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(66.67%+19.02px)] top-[6145.97px]" data-node-id="4:356">
            <div className="absolute contents left-[calc(66.67%+19.02px)] top-[6145.97px]" data-node-id="4:357" data-name="Mask Group">
              <div className="absolute h-[210.198px] left-[calc(66.67%+19.02px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[139.821px_135.16px] top-[6145.97px] w-[139.821px]" data-node-id="4:359" style={{ maskImage: `url('${imgImage7}')` }} data-name="image 11">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage11} />
              </div>
            </div>
            <div className="absolute contents left-[calc(66.67%+26.48px)] top-[6255.5px]" data-node-id="4:360">
              <div className="absolute backdrop-blur-[5.546px] bg-[rgba(201,211,231,0.4)] h-[18.177px] left-[calc(66.67%+26.48px)] rounded-[5.546px] top-[6255.5px] w-[95.078px]" data-node-id="4:361" />
              <div className="absolute contents left-[calc(66.67%+31.14px)] top-[6261.56px]" data-node-id="4:362">
                <div className="absolute bg-white h-[3.262px] left-[calc(66.67%+31.14px)] rounded-[0.555px] top-[6264.82px] w-[1.398px]" data-node-id="4:363" />
                <div className="absolute bg-white h-[4.894px] left-[calc(66.67%+33.47px)] rounded-[0.555px] top-[6263.19px] w-[1.398px]" data-node-id="4:364" />
                <div className="absolute bg-white h-[6.525px] left-[calc(66.67%+35.8px)] rounded-[0.555px] top-[6261.56px] w-[1.398px]" data-node-id="4:365" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(75%+27.31px)] top-[6155.59px]" data-node-id="4:366">
            <div className="absolute contents left-[calc(75%+27.31px)] top-[6155.59px]" data-node-id="4:367" data-name="Mask Group">
              <div className="absolute left-[calc(75%-15.05px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[42.357px_30.255px] mask-size-[201.696px_194.973px] size-[286.409px] top-[6125.33px]" data-node-id="4:369" style={{ maskImage: `url('${imgImage12}')` }} data-name="image 10">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage13} />
              </div>
            </div>
            <div className="absolute contents left-[calc(75%+38.06px)] top-[6313.58px]" data-node-id="4:370">
              <div className="absolute backdrop-blur-[8px] bg-[rgba(201,211,231,0.4)] h-[26.221px] left-[calc(75%+38.06px)] rounded-[8px] top-[6313.58px] w-[133.792px]" data-node-id="4:371" />
              <div className="absolute contents left-[calc(75%+44.79px)] top-[6322.32px]" data-node-id="4:372">
                <div className="absolute bg-white h-[4.706px] left-[calc(75%+44.79px)] rounded-[0.8px] top-[6327.03px] w-[2.017px]" data-node-id="4:373" />
                <div className="absolute bg-white h-[7.059px] left-[calc(75%+48.15px)] rounded-[0.8px] top-[6324.68px] w-[2.017px]" data-node-id="4:374" />
                <div className="absolute bg-white h-[9.412px] left-[calc(75%+51.51px)] rounded-[0.8px] top-[6322.32px] w-[2.017px]" data-node-id="4:375" />
              </div>
            </div>
          </div>
          <div className="absolute left-[calc(66.67%-27.84px)] size-[78.157px] top-[6124.49px]" data-node-id="4:376">
            <div className="absolute inset-[-30.71%_-46.06%_-56.3%_-40.94%]">
              <img alt="" className="block max-w-none size-full" src={imgGroup70} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute contents left-[calc(8.33%+139px)] top-[6394px]" data-node-id="4:379">
        <div className="absolute contents left-[calc(8.33%+139px)] top-[6394px]" data-node-id="4:380">
          <div className="absolute left-[calc(8.33%+171.57px)] size-[19.161px] top-[7026.33px]" data-node-id="4:381">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse105} />
          </div>
          <div className="absolute left-[calc(41.67%+50.85px)] size-[16.287px] top-[6752.32px]" data-node-id="4:382">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse108} />
          </div>
          <div className="absolute left-[calc(8.33%+139px)] size-[99.64px] top-[6419.87px]" data-node-id="4:383">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse106} />
          </div>
          <div className="absolute left-[calc(16.67%+96.84px)] size-[22.994px] top-[6394px]" data-node-id="4:384">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse107} />
          </div>
          <div className="absolute bg-white h-[562.39px] left-[calc(8.33%+184.99px)] rounded-[18.206px] shadow-[0px_9.103px_43.694px_0px_rgba(40,43,111,0.1)] top-[6438.07px] w-[465.624px]" data-node-id="4:385" />
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] h-[103.472px] leading-[1.6] left-[calc(16.67%+450.37px)] not-italic text-[#55578d] text-[29px] text-right top-[6564.54px] w-[387.062px]" dir="auto" data-node-id="4:386">
            مطالعه سیگنال‌ها و سیستم‌ها به دو موضوع می‌پردازد: اطلاعات و چگونگی
          </p>
          <div className="absolute flex items-center justify-center left-[calc(33.33%+65.22px)] size-[89.822px] top-[6416.99px]">
            <div className="flex-none rotate-[-10.96deg]">
              <div className="relative size-[76.646px]" data-node-id="4:387">
                <div className="absolute inset-[-47.51%_-52.26%_-57.01%_-52.26%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup90} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex items-center justify-center left-[calc(33.33%+120.79px)] size-[92.816px] top-[6464.9px]">
            <div className="flex-none rotate-[13.9deg]">
              <div className="relative size-[76.646px]" data-node-id="4:391">
                <div className="absolute inset-[-47.51%_-52.26%_-57.01%_-52.26%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup88} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bg-[#dce2ee] h-[47.904px] left-[calc(16.67%+63.31px)] rounded-[72.824px] top-[6476.39px] w-[174.37px]" data-node-id="4:396" />
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] h-[34px] leading-[1.6] left-[calc(16.67%+214px)] not-italic text-[#717fb0] text-[20.026px] text-right top-[6486px] w-[138px]" dir="auto" data-node-id="4:397">
            سیگنال معاملاتی
          </p>
          <div className="absolute contents left-[calc(16.67%+96.84px)] top-[6736.99px]" data-node-id="4:398" data-name="Mask Group">
            <div className="absolute h-[258.672px] left-[calc(16.67%+68.61px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[28.235px_15.484px] mask-size-[406.224px_227.704px] opacity-90 rounded-[18.206px] top-[6721.51px] w-[461.783px]" data-node-id="4:400" style={{ maskImage: `url('${imgImage14}')` }} data-name="image 13">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18.206px] size-full" src={imgImage15} />
            </div>
          </div>
          <div className="absolute contents left-[calc(16.67%+59.48px)] top-[6706.33px]" data-node-id="4:401" data-name="Mask Group">
            <div className="absolute h-[290.395px] left-[calc(8.33%+187.78px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[31.698px_17.383px] mask-size-[456.043px_255.63px] rounded-[18.206px] top-[6688.95px] w-[518.417px]" data-node-id="4:403" style={{ maskImage: `url('${imgImage16}')` }} data-name="image 13">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18.206px] size-full" src={imgImage15} />
            </div>
            <div className="absolute h-[683px] left-[96px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[283.479px_213.332px] mask-size-[456.043px_255.63px] top-[6493px] w-[1024px]" data-node-id="4:404" style={{ maskImage: `url('${imgImage16}')` }} data-name="image 17">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage17} />
            </div>
          </div>
          <div className="absolute contents left-[calc(25%+70.97px)] top-[6919.98px]" data-node-id="4:405">
            <div className="absolute bg-white h-[119.759px] left-[calc(25%+70.97px)] rounded-[18.206px] shadow-[0px_18.206px_52.797px_0px_rgba(40,43,111,0.08)] top-[6919.98px] w-[365.026px]" data-node-id="4:406" />
            <div className="absolute left-[calc(41.67%+18.5px)] size-[59.401px] top-[6953.5px]" data-node-id="4:407">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse104} />
            </div>
            <div className="-translate-x-full absolute font-['Poppins:SemiBold',sans-serif] h-[67.065px] leading-[0] left-[calc(25%+315.66px)] not-italic text-[#0a0b0c] text-[0px] text-right top-[6952px] w-[190.657px]" data-node-id="4:408">
              <p className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.6] mb-0 text-[15px]" dir="auto">
                طلا نقاط وورد و خروج
              </p>
              <p className="leading-[1.6] text-[20.026px]" dir="auto">
                در میان مدت
              </p>
            </div>
            <div className="absolute contents h-[76.444px] left-[calc(41.67%+7px)] top-[6942px] w-[88.3px]" data-node-id="4:409">
              <div className="absolute flex items-center justify-center left-[calc(41.67%+30.95px)] size-[64.353px] top-[6942px]">
                <div className="flex-none rotate-[-26.79deg]">
                  <div className="overflow-clip relative size-[47.904px]" data-node-id="4:410" data-name="send 1">
                    <div className="absolute contents inset-[6.86%_0]" data-node-id="4:411" data-name="Group">
                      <div className="absolute inset-[6.86%_0]" data-node-id="4:412" data-name="Group">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex h-[11.227px] items-center justify-center left-[calc(41.67%+15.21px)] top-[6980.7px] w-[22.236px]">
                <div className="flex-none rotate-[-26.79deg]">
                  <div className="h-0 relative w-[24.91px]" data-node-id="4:414">
                    <div className="absolute inset-[-2.73px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgLine6} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex h-[7.773px] items-center justify-center left-[calc(41.67%+24.64px)] top-[6985.84px] w-[15.394px]">
                <div className="flex-none rotate-[-26.79deg]">
                  <div className="h-0 relative w-[17.245px]" data-node-id="4:415">
                    <div className="absolute inset-[-2.73px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgLine7} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex h-[4.75px] items-center justify-center left-[calc(41.67%+33.22px)] top-[6990.97px] w-[9.408px]">
                <div className="flex-none rotate-[-26.79deg]">
                  <div className="h-0 relative w-[10.539px]" data-node-id="4:416">
                    <div className="absolute inset-[-2.73px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgLine8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(50%+26px)] not-italic text-[22.129px] text-white top-[6300px] whitespace-nowrap" dir="auto" data-node-id="4:417">
        جلسات آنلاین مشاوره
      </p>
      <div className="absolute left-[calc(25%+82px)] size-[93px] top-[6933px]" data-node-id="4:418" data-name="image 16">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage18} />
      </div>
      <div className="absolute contents left-[calc(50%-1px)] top-[7164px]" data-node-id="4:419">
        <div className="absolute left-[calc(83.33%-42.2px)] size-[112.981px] top-[7164px]" data-node-id="4:420">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse118} />
        </div>
        <div className="absolute flex h-[33.811px] items-center justify-center left-[calc(91.67%-80.75px)] top-[7273.22px] w-[34.987px]">
          <div className="flex-none rotate-[-18.24deg]">
            <div className="h-[26.317px] relative w-[28.164px]" data-node-id="4:421">
              <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
                <img alt="" className="block max-w-none size-full" src={imgPolygon3} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-[#73bcff] h-[193.009px] left-[calc(50%-1px)] rounded-[18.83px] top-[7387.14px] w-[196.775px]" data-node-id="4:422" />
        <div className="absolute contents left-[calc(50%+17.83px)] top-[7195.07px]" data-node-id="4:423">
          <div className="absolute h-[365.476px] left-[calc(50%+17.83px)] top-[7195.07px] w-[658.115px]" data-node-id="4:424">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup68} />
          </div>
          <div className="absolute contents left-[calc(50%+53.93px)] top-[7490.93px]" data-node-id="4:430">
            <div className="absolute bg-[#3465e1] h-[38.675px] left-[calc(50%+53.93px)] rounded-[38.675px] shadow-[0px_6.446px_15.47px_0px_rgba(52,101,225,0.3)] top-[7490.93px] w-[116.024px]" data-node-id="4:431" />
            <p className="absolute font-['Nunito_Sans:Bold',sans-serif] font-bold h-[22.56px] leading-[normal] left-[calc(50%+81.64px)] text-[16.759px] text-white top-[7498.67px] w-[59.946px]" data-node-id="4:432" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
              Present
            </p>
          </div>
          <div className="absolute contents left-[calc(58.33%+35.73px)] top-[7490.93px]" data-node-id="4:433">
            <div className="absolute bg-[#e13468] h-[38.675px] left-[calc(58.33%+35.73px)] rounded-[38.675px] shadow-[0px_6.446px_15.47px_0px_rgba(202,47,93,0.3)] top-[7490.93px] w-[116.024px]" data-node-id="4:434" />
            <p className="absolute font-['Nunito_Sans:Bold',sans-serif] font-bold h-[22.56px] leading-[normal] left-[calc(58.33%+87.94px)] text-[16.759px] text-white top-[7498.67px] w-[31.584px]" data-node-id="4:435" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
              Call
            </p>
            <div className="absolute left-[calc(58.33%+67.96px)] size-[12.892px] top-[7503.82px]" data-node-id="4:436" data-name="phone 1">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPhone1} />
            </div>
          </div>
          <div className="absolute contents left-[calc(75%+37.72px)] top-[7265.33px]" data-node-id="4:438">
            <div className="absolute contents left-[calc(75%+37.72px)] top-[7265.33px]" data-node-id="4:439" data-name="Mask Group">
              <div className="absolute h-[121.799px] left-[calc(75%+23.02px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[14.7px_0px] mask-size-[125.999px_121.799px] top-[7265.33px] w-[156.239px]" data-node-id="4:441" style={{ maskImage: `url('${imgImage19}')` }} data-name="image 8">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage9} />
              </div>
            </div>
            <div className="absolute contents left-[calc(75%+44.44px)] top-[7364.03px]" data-node-id="4:442">
              <div className="absolute backdrop-blur-[4.2px] bg-[rgba(201,211,231,0.4)] h-[16.38px] left-[calc(75%+44.44px)] rounded-[4.2px] top-[7364.03px] w-[63.84px]" data-node-id="4:443" />
              <p className="absolute font-['Nunito_Sans:SemiBold',sans-serif] font-semibold h-[11.34px] leading-[normal] left-[calc(75%+58.3px)] text-[8.4px] text-white top-[7366.55px] w-[45.78px]" data-node-id="4:444" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
                Adam Levin
              </p>
              <div className="absolute contents left-[calc(75%+48.64px)] top-[7369.49px]" data-node-id="4:445">
                <div className="absolute bg-white h-[2.94px] left-[calc(75%+48.64px)] rounded-[0.42px] top-[7372.43px] w-[1.26px]" data-node-id="4:446" />
                <div className="absolute bg-white h-[4.41px] left-[calc(75%+50.74px)] rounded-[0.42px] top-[7370.96px] w-[1.26px]" data-node-id="4:447" />
                <div className="absolute bg-white h-[5.88px] left-[calc(75%+52.84px)] rounded-[0.42px] top-[7369.49px] w-[1.26px]" data-node-id="4:448" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(66.67%+45.26px)] top-[7265.33px]" data-node-id="4:449">
            <div className="absolute contents left-[calc(66.67%+45.26px)] top-[7265.33px]" data-node-id="4:450" data-name="Mask Group">
              <div className="absolute h-[119.279px] left-[calc(66.67%+35.18px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[10.08px_-2.52px] mask-size-[125.999px_121.799px] top-[7267.85px] w-[146.159px]" data-node-id="4:452" style={{ maskImage: `url('${imgImage19}')` }} data-name="image 7">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage10} />
              </div>
            </div>
            <div className="absolute contents left-[calc(66.67%+51.98px)] top-[7364.03px]" data-node-id="4:453">
              <div className="absolute backdrop-blur-[4.2px] bg-[rgba(201,211,231,0.4)] h-[16.38px] left-[calc(66.67%+51.98px)] rounded-[4.2px] top-[7364.03px] w-[73.5px]" data-node-id="4:454" />
              <p className="absolute font-['Nunito_Sans:SemiBold',sans-serif] font-semibold h-[11.34px] leading-[normal] left-[calc(66.67%+65.84px)] text-[8.4px] text-white top-[7366.55px] w-[55.44px]" data-node-id="4:455" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
                Tamara Clarke
              </p>
              <div className="absolute contents left-[calc(66.67%+56.18px)] top-[7369.49px]" data-node-id="4:456">
                <div className="absolute bg-white h-[2.94px] left-[calc(66.67%+56.18px)] rounded-[0.42px] top-[7372.43px] w-[1.26px]" data-node-id="4:457" />
                <div className="absolute bg-white h-[4.41px] left-[calc(66.67%+58.28px)] rounded-[0.42px] top-[7370.96px] w-[1.26px]" data-node-id="4:458" />
                <div className="absolute bg-white h-[5.88px] left-[calc(66.67%+60.38px)] rounded-[0.42px] top-[7369.49px] w-[1.26px]" data-node-id="4:459" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(50%+53.61px)] top-[7264.74px]" data-node-id="4:460">
            <div className="absolute contents left-[calc(50%+61.34px)] top-[7284.72px]" data-node-id="4:461" data-name="Mask Group">
              <div className="absolute h-[171.974px] left-[calc(50%+32.28px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[29.058px_0px] mask-size-[177.904px_171.974px] opacity-50 rounded-[12.892px] top-[7284.72px] w-[256.774px]" data-node-id="4:463" style={{ maskImage: `url('${imgPortraitTeacherGivingOnlineClass4}')` }} data-name="portrait-teacher-giving-online-class 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12.892px] size-full" src={imgPortraitTeacherGivingOnlineClass2} />
              </div>
            </div>
            <div className="absolute h-[186.928px] left-[calc(50%+53.61px)] top-[7264.74px] w-[193.374px]" data-node-id="4:464" data-name="Mask Group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaskGroup} />
            </div>
          </div>
          <div className="absolute contents left-[calc(66.67%+45.26px)] top-[7406.03px]" data-node-id="4:468">
            <div className="absolute contents left-[calc(66.67%+45.26px)] top-[7406.03px]" data-node-id="4:469" data-name="Mask Group">
              <div className="absolute h-[189.419px] left-[calc(66.67%+45.26px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[125.999px_121.799px] top-[7406.03px] w-[125.999px]" data-node-id="4:471" style={{ maskImage: `url('${imgImage19}')` }} data-name="image 11">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage11} />
              </div>
            </div>
            <div className="absolute contents left-[calc(66.67%+51.98px)] top-[7504.73px]" data-node-id="4:472">
              <div className="absolute backdrop-blur-[4.2px] bg-[rgba(201,211,231,0.4)] h-[16.38px] left-[calc(66.67%+51.98px)] rounded-[4.2px] top-[7504.73px] w-[85.679px]" data-node-id="4:473" />
              <p className="absolute font-['Nunito_Sans:SemiBold',sans-serif] font-semibold h-[11.34px] leading-[normal] left-[calc(66.67%+65.84px)] text-[8.4px] text-white top-[7507.25px] w-[67.62px]" data-node-id="4:474" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
                Humbert Holland
              </p>
              <div className="absolute contents left-[calc(66.67%+56.18px)] top-[7510.19px]" data-node-id="4:475">
                <div className="absolute bg-white h-[2.94px] left-[calc(66.67%+56.18px)] rounded-[0.42px] top-[7513.13px] w-[1.26px]" data-node-id="4:476" />
                <div className="absolute bg-white h-[4.41px] left-[calc(66.67%+58.28px)] rounded-[0.42px] top-[7511.66px] w-[1.26px]" data-node-id="4:477" />
                <div className="absolute bg-white h-[5.88px] left-[calc(66.67%+60.38px)] rounded-[0.42px] top-[7510.19px] w-[1.26px]" data-node-id="4:478" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(75%+37.72px)] top-[7406.03px]" data-node-id="4:479">
            <div className="absolute contents left-[calc(75%+37.72px)] top-[7406.03px]" data-node-id="4:480" data-name="Mask Group">
              <div className="absolute left-[calc(75%+11.26px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[26.46px_18.9px] mask-size-[125.999px_121.799px] size-[178.919px] top-[7387.13px]" data-node-id="4:482" style={{ maskImage: `url('${imgImage19}')` }} data-name="image 10">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage13} />
              </div>
            </div>
            <div className="absolute contents left-[calc(75%+44.44px)] top-[7504.73px]" data-node-id="4:483">
              <div className="absolute backdrop-blur-[4.2px] bg-[rgba(201,211,231,0.4)] h-[16.38px] left-[calc(75%+44.44px)] rounded-[4.2px] top-[7504.73px] w-[83.579px]" data-node-id="4:484" />
              <p className="absolute font-['Nunito_Sans:SemiBold',sans-serif] font-semibold h-[11.34px] leading-[normal] left-[calc(75%+58.3px)] text-[8.4px] text-white top-[7507.25px] w-[65.52px]" data-node-id="4:485" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
                Patricia Mendoza
              </p>
              <div className="absolute contents left-[calc(75%+48.64px)] top-[7510.19px]" data-node-id="4:486">
                <div className="absolute bg-white h-[2.94px] left-[calc(75%+48.64px)] rounded-[0.42px] top-[7513.13px] w-[1.26px]" data-node-id="4:487" />
                <div className="absolute bg-white h-[4.41px] left-[calc(75%+50.74px)] rounded-[0.42px] top-[7511.66px] w-[1.26px]" data-node-id="4:488" />
                <div className="absolute bg-white h-[5.88px] left-[calc(75%+52.84px)] rounded-[0.42px] top-[7510.19px] w-[1.26px]" data-node-id="4:489" />
              </div>
            </div>
          </div>
          <div className="absolute backdrop-blur-[4.708px] bg-[rgba(136,167,227,0.1)] h-[363.423px] left-[calc(50%+17.83px)] rounded-[18.83px] top-[7196.95px] w-[658.115px]" data-node-id="4:490" />
        </div>
        <div className="absolute contents left-[calc(50%+121.4px)] top-[7294.87px]" data-node-id="4:491">
          <div className="absolute bg-white h-[368.13px] left-[calc(50%+121.4px)] rounded-[18.83px] shadow-[0px_18.83px_47.075px_0px_rgba(47,50,125,0.1)] top-[7294.87px] w-[591.268px]" data-node-id="4:492" />
          <div className="absolute bg-[#eaeaea] h-[24.479px] left-[calc(50%+121.4px)] rounded-tl-[18.83px] rounded-tr-[18.83px] top-[7294.87px] w-[591.268px]" data-node-id="4:493" />
          <div className="absolute contents left-[calc(58.33%+14.99px)] top-[7356.07px]" data-node-id="4:494">
            <div className="absolute contents left-[calc(58.33%+14.99px)] top-[7356.07px]" data-node-id="4:495" data-name="Mask Group">
              <div className="absolute h-[192.538px] left-[calc(58.33%-17.55px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[32.532px_0px] mask-size-[199.177px_192.538px] rounded-[12.892px] top-[7356.07px] w-[287.479px]" data-node-id="4:497" style={{ maskImage: `url('${imgPortraitTeacherGivingOnlineClass5}')` }} data-name="portrait-teacher-giving-online-class 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12.892px] size-full" src={imgPortraitTeacherGivingOnlineClass2} />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(75%-22.48px)] top-[7356.07px]" data-node-id="4:498">
            <div className="absolute contents left-[calc(75%-22.48px)] top-[7356.07px]" data-node-id="4:499" data-name="Mask Group">
              <div className="absolute left-[calc(66.67%+95.76px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[41.759px_29.829px] mask-size-[198.853px_192.225px] size-[282.372px] top-[7326.24px]" data-node-id="4:501" style={{ maskImage: `url('${imgImage20}')` }} data-name="image 10">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage13} />
              </div>
            </div>
            <div className="absolute contents left-[calc(75%-11.88px)] top-[7511.84px]" data-node-id="4:502">
              <div className="absolute backdrop-blur-[6.628px] bg-[rgba(201,211,231,0.4)] h-[25.851px] left-[calc(75%-11.88px)] rounded-[6.628px] top-[7511.84px] w-[131.906px]" data-node-id="4:503" />
              <p className="absolute font-['Nunito_Sans:SemiBold',sans-serif] font-semibold h-[17.897px] leading-[normal] left-[calc(75%+9.99px)] text-[13.257px] text-white top-[7515.81px] w-[103.404px]" data-node-id="4:504" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
                Patricia Mendoza
              </p>
              <div className="absolute contents left-[calc(75%-5.25px)] top-[7520.45px]" data-node-id="4:505">
                <div className="absolute bg-white h-[4.64px] left-[calc(75%-5.25px)] rounded-[0.663px] top-[7525.09px] w-[1.989px]" data-node-id="4:506" />
                <div className="absolute bg-white h-[6.96px] left-[calc(75%-1.94px)] rounded-[0.663px] top-[7522.77px] w-[1.989px]" data-node-id="4:507" />
                <div className="absolute bg-white h-[9.28px] left-[calc(75%+1.38px)] rounded-[0.663px] top-[7520.45px] w-[1.989px]" data-node-id="4:508" />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[calc(75%-2.71px)] top-[7588.62px]" data-node-id="4:509">
            <div className="absolute bg-[#eb493a] blur-[25.421px] h-[27.304px] left-[calc(75%+8.58px)] rounded-[56.491px] top-[7611.22px] w-[172.296px]" data-node-id="4:510" />
            <div className="absolute h-[54.608px] left-[calc(75%-2.71px)] rounded-[56.491px] top-[7588.62px] w-[197.717px]" data-node-id="4:511" style={{ backgroundImage: "linear-gradient(135.1193414236296deg, rgb(245, 84, 84) 19.572%, rgb(229, 66, 43) 78.846%)" }} />
            <p className="-translate-x-1/2 absolute font-['Yekan_Bakh:Medium',sans-serif] h-[31.07px] leading-[normal] left-[calc(75%+94.67px)] not-italic text-[20.713px] text-center text-white top-[7601px] w-[155.349px]" dir="auto" data-node-id="4:512">
              پایان مکالمه
            </p>
          </div>
          <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] h-[36px] leading-[1.6] left-[calc(58.33%+262px)] not-italic text-[#696984] text-[22.596px] text-right top-[7580px] w-[236px]" dir="auto" data-node-id="4:513">
            تماس دوره ای مشاوره
          </p>
          <p className="absolute font-['Nunito_Sans:SemiBold',sans-serif] font-semibold h-[27.304px] leading-[1.6] left-[calc(58.33%-0.94px)] text-[#a8a8b6] text-[16.947px] top-[7616.87px] w-[262.681px]" data-node-id="4:514" style={{ fontVariationSettings: "'YTLC' 500, 'wdth' 100" }}>
            Your video can’t be seen by others
          </p>
          <div className="absolute h-[12.24px] left-[calc(58.33%-10.36px)] top-[7300.99px] w-[48.958px]" data-node-id="4:515">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup102} />
          </div>
          <div className="absolute flex h-[197.717px] items-center justify-center left-[calc(66.67%+97.03px)] top-[7356.07px] w-0">
            <div className="flex-none rotate-90">
              <div className="h-0 relative w-[197.717px]" data-node-id="4:519">
                <div className="absolute inset-[-0.94px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine9} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center left-[calc(50%+63.02px)] size-[111.025px] top-[7322.17px]">
          <div className="flex-none rotate-[-6.16deg]">
            <div className="relative size-[100.79px]" data-node-id="4:520">
              <div className="absolute inset-[-35.5%_-44.84%_-54.18%_-44.84%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup105} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[908px] left-[-231px] rounded-[5px] top-[7862px] w-[705px]" data-node-id="4:525">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle4496} />
      </div>
      <div className="absolute bg-black h-[908px] left-[calc(25%+86px)] rounded-[5px] top-[7862px] w-[705px]" data-node-id="4:526" />
      <div className="absolute h-[908px] right-[-144px] rounded-[5px] top-[7862px] w-[705px]" data-node-id="4:527">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle4498} />
      </div>
      <div className="absolute bg-[rgba(0,0,0,0.62)] h-[908px] right-[-144px] rounded-[5px] top-[7862px] w-[705px]" data-node-id="4:528" />
      <div className="absolute right-[170.52px] size-[153.484px] top-[8239px]" data-node-id="4:529">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1000001986} />
      </div>
      <p className="absolute font-['Yekan_Bakh:Regular',sans-serif] h-[163px] leading-[1.8] not-italic right-[36px] text-[24px] text-right text-white top-[8562px] tracking-[0.48px] w-[465px]" dir="auto" data-node-id="4:533">
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و
      </p>
      <div className="absolute h-[908px] left-[calc(25%+132px)] top-[7862px] w-[602px]" data-node-id="4:534" data-name="رول اپ چهارم 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[156.06%] left-[-0.02%] max-w-none top-0 w-[100.05%]" src={img1} />
        </div>
      </div>
      <div className="absolute bg-[rgba(0,0,0,0.62)] h-[908px] left-[calc(25%+87px)] rounded-[5px] top-[7862px] w-[705px]" data-node-id="4:535" />
      <div className="absolute bg-[rgba(0,0,0,0.62)] h-[908px] left-[-226px] rounded-[5px] top-[7862px] w-[705px]" data-node-id="4:536" />
      <div className="absolute right-[calc(41.67%+130.52px)] size-[153.484px] top-[8229px]" data-node-id="4:537">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1000001987} />
      </div>
      <div className="absolute right-[calc(91.67%-48.48px)] size-[153.484px] top-[8229px]" data-node-id="4:541">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1000001987} />
      </div>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[163px] leading-[1.8] left-[calc(33.33%+516px)] not-italic text-[24px] text-right text-white top-[8562.48px] tracking-[0.48px] w-[465px]" dir="auto" data-node-id="4:545">
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و
      </p>
      <div className="absolute flex h-[154px] items-center justify-center left-[-22px] top-[8562px] w-[441px]">
        <div className="-scale-y-100 flex-none rotate-180">
          <p className="font-['Yekan_Bakh:Regular',sans-serif] h-[154px] leading-[1.8] not-italic relative text-[24px] text-white tracking-[0.48px] w-[441px]" dir="auto" data-node-id="4:546">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و
          </p>
        </div>
      </div>
      <div className="absolute contents left-[calc(50%+99px)] top-[9088px]" data-node-id="4:547">
        <div className="absolute contents left-[calc(50%+99px)] top-[9088px]" data-node-id="4:548">
          <div className="absolute h-[340px] left-[calc(50%+99px)] rounded-[20px] top-[9088px] w-[640px]" data-node-id="4:549">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle32} />
          </div>
          <div className="absolute bg-[#171b41] h-[340px] left-[calc(50%+99px)] opacity-10 rounded-[20px] top-[9088px] w-[640px]" data-node-id="4:550" />
        </div>
        <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[1.8] left-[calc(50%+738px)] not-italic text-[#252641] text-[26px] text-right top-[9523px] w-[609px]" dir="auto" data-node-id="4:551">
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
        </p>
        <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] leading-[1.8] left-[calc(50%+738px)] not-italic text-[#696984] text-[20px] text-right top-[9637px] tracking-[0.4px] w-[609px]" dir="auto" data-node-id="4:552">
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است
        </p>
        <p className="[text-decoration-skip-ink:none] absolute decoration-solid font-['Yekan_Bakh:Regular',sans-serif] leading-[1.8] left-[calc(83.33%+7px)] not-italic text-[#696984] text-[20px] top-[9728px] tracking-[0.4px] underline whitespace-nowrap" dir="auto" data-node-id="4:553">
          مطالعه بیشتر
        </p>
        <div className="absolute contents left-[calc(50%+99px)] top-[9468px]" data-node-id="4:554">
          <div className="absolute bg-[#49bbbd] h-[40px] left-[calc(50%+99px)] rounded-[80px] top-[9468px] w-[130px]" data-node-id="4:555" />
          <p className="absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[1.8] left-[calc(58.33%-8px)] not-italic text-[20px] text-white top-[9470px] tracking-[0.4px] whitespace-nowrap" dir="auto" data-node-id="4:556">
            خبر
          </p>
        </div>
      </div>
    </div>
  );
}