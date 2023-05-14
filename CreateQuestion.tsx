// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Link, useHistory } from "react-router-dom";
import { admin_url } from "../../helper/Api";
import { ApiFetcher } from "../../helper/Service";
import Question from '../../common/Question';

let sectionCounter = 1;
let quesCounter = 1;
let sortQuestionArr = [];

export default function EditQuestion() {

  const fetchData = ApiFetcher();
  const history = useHistory();

  const closeDeleteModalbtn = useRef(null);
  const getLinkModalBtn = useRef(null);
  const closeGetModalBtn = useRef(null);
  const msgModalBtn = useRef(null);

  const [msg, setMsg] =useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState([]);
  const [sectionToggle, setSectionToggle] = useState(false);
  const [tool, setTool] = useState({
    id: '',
    name: '',
    description: '',
  });

  const sectionObj = {
    sec_no: sectionCounter,
    name: '',
    description: '',
    quesToggleMode: false,
    questions: [],
  }

  const quesObj = {
    qus_no: quesCounter,
    title: '',
    description: '',
    left_ques: '',
    right_ques: '',
    serial_no: '',
    max_value: 5,
  }

  useEffect(() => {

    let myobj = document.getElementById("test");
    if (myobj) {
      myobj.remove();
    }

    let script = document.createElement("script");
    script.src = "js/dnd.js";
    script.id = "test";

    document.body.appendChild(script);
    console.log(section);

  }, [section]);

  const copyLink = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        closeGetModalBtn.current.click();
        msgModalBtn.current.click();
        setMsg('The URL has been copied to your clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  }

  const getLink = () => {
    if(tool.id == ""){
      return alert('Please click Save button first');
    }
    const url = window.location.origin + '/#login/' + tool.id;
    setUrl(url);
    getLinkModalBtn.current.click();
  }

  const addQuestionSerialNo = () => {
    console.log('----------------------------------------------------');

    const tmp = [...section];
    let sortable_val = document.getElementById('sortable_val').value;

    for (let i = 1; i <= sortable_val; i++) {
      let ElementCount = document.getElementById('sortable_' + i)?.childElementCount;
      for (let j = 0; j < ElementCount; j++) {
        let sec_ques_id = document.getElementById('sortable_' + i)?.children[j].getAttribute('data');
        let arr = sec_ques_id.split('_');
        let sec_no = arr[0];
        let qus_no = arr[1];

        tmp.map(obj => {
          if (obj.sec_no == sec_no) {
            obj.questions.map(queObj => {
              if (queObj.qus_no == qus_no) {
                queObj.serial_no = j + 1;
              }
            })
          }
        });
      }
    }


    tmp.forEach((item) => {
      item.questions.sort((a, b) => a.serial_no - b.serial_no);
    });
    
    setSection(tmp);

  }


  const sortQuestion = () => {
    let tmp = [...section];
    tmp.forEach((item) => {
      item.questions.sort((a, b) => a.serial_no - b.serial_no);
    });

    setSection(tmp);

    // const sortedArray = tmp.sort((a, b) => a.serial_no - b.serial_no);
    // tmp.map((obj) => {
    //   obj.quesions.sort((a, b) => (a.serial_no > b.serial_no) ? 1 : -1);
    // });

    // return sortedArray;
  }

  const save = () => {


    if (section.length == 0) {
      return false;
    }

    for (let i = 0; i < section.length; i++) {
      if (section[i].name == '' || section[i].description == '') {
        // return alert('Please fill all section details');
      }

      for (let j = 0; j < section[i].questions.length; j++) {
        if (section[i].questions[j].title == '' || section[i].questions[j].left_ques == '' || section[i].questions[j].right_ques == '') {
          // return alert('Please fill all question details');
        }

      }

    }

    // addQuestionSerialNo();
    console.log(tool);

    const data = {
      questionnaries: {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        QuestionnairesArea: section,
      }
    }

    const requestBody = { 'json': JSON.stringify(data) };

    fetchData(admin_url.QUESTIONNAIRESTORE, "post", requestBody)
      .then((res) => {
        console.log(res.data.questionarie_id);
        let id = res.data.questionarie_id;
        if (res.status == 200) {
          setTool({ ...tool, id });
          console.log(tool);
          setMsg(`The tool: ${tool.name} has been saved and can be accessed in the main tool screen.`)
          msgModalBtn.current.click();
        } else {
          // alert('Something went wrong! Please try again later.');
        }
      })
      .catch((error) => {
        console.log(error);
        // alert('Something went wrong! Please try again later.');
      });

  }

  const publish = () => {
    if (tool.id == '') {
      return alert('Please click Save button first');
    }

    fetchData(admin_url.QUESTIONNAIRESPUBLISH + tool.id, "get")
      .then((res) => {
        getLink()
        if (res.status == 200) {

        } else {
          // alert('Something went wrong! Please try again later.');
        }
      })
      .catch((error) => {
        console.log(error);
        // alert('Something went wrong! Please try again later.');
      });
  }
  const handleToolName = (name: string) => {
    setTool({ ...tool, name })
  };

  const handleToolDes = (description: string) => {
    setTool({ ...tool, description })
  };

  const handleSecTitle = (title, sec_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    obj.name = title;
    setSection(tmp);
    // console.log(section);
  }

  const handleSecDesc = (value, sec_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    obj.description = value;
    setSection(tmp);
    // console.log(section);
  }

  const deleteSection = (sec_no) => {
    let tmp = []
    if (window.confirm('Are you sure you want to delete ?')) {

      section.map(obj => {
        if (sec_no != obj.sec_no) {
          tmp.push(obj);
        }
      });

      setSection(tmp);
    }

  }

  const setThisQuesToggle = (sec_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);
    obj.quesToggleMode = !obj.quesToggleMode;
    setSection(tmp);
  }

  const handleQustitle = (value, sec_no, qus_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    const tmpQustion = [...obj.questions];

    const objQues = tmpQustion.find(obj => obj.qus_no == qus_no);
    // console.log(objQues);

    objQues.title = value;

    setSection(tmp);
    // console.log(section);
  }

  const handleQusmaxValue = (value, sec_no, qus_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    const tmpQustion = [...obj.questions];

    const objQues = tmpQustion.find(obj => obj.qus_no == qus_no);
    // console.log(objQues);

    objQues.max_value = value;

    setSection(tmp);
    // console.log(section);
  }

  const addSection = () => {
    setSectionToggle(!sectionToggle)

    if (tool.description == '' || tool.description == '') {
      // return alert('Please fillup tool details'); 
    }

    const tmp = [...section];
    tmp.push(sectionObj);

    document.getElementById('sortable_val').value = sectionCounter;
    sectionCounter += 1;


    setSection(tmp);

  }

  const handleLeft = (value, sec_no, qus_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    const tmpQustion = [...obj.questions];
    const objQues = tmpQustion.find(obj => obj.qus_no == qus_no);
    objQues.left_ques = value;

    setSection(tmp);
    // console.log(section);
  }

  const handleRight = (value, sec_no, qus_no) => {
    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    const tmpQustion = [...obj.questions];
    const objQues = tmpQustion.find(obj => obj.qus_no == qus_no);
    objQues.right_ques = value;

    setSection(tmp);
    // console.log(section);
  }

  const addQuestion = (sec_no) => {

    const tmp = [...section];
    const obj = tmp.find(obj => obj.sec_no == sec_no);

    if (obj.name == '' || obj.description == '') {
      // return alert('Please fill all details in the section');
    }

    const tmpQustion = [...obj.questions];
    if (tmpQustion.length > 0) {
      quesObj.serial_no = tmpQustion[tmpQustion.length - 1].serial_no + 1;
    } else {
      quesObj.serial_no = 1;
    }

    tmpQustion.push(quesObj);
    obj.questions = tmpQustion;
    obj.quesToggleMode = !obj.quesToggleMode;

    quesCounter += 1;

    setSection(tmp);

  }

  const  mySort = (arr) =>{
    return arr.sort((a, b) => a.serial_no - b.serial_no);
  }
  const deleteQuestion = (sec_no, qus_no) => {
    console.log(sec_no, qus_no);
    let newArr = [];
    let tmp = [];

    if (window.confirm('Are you sure you want to delete ?')) {
      section.map(obj => {
        if (obj.sec_no == sec_no) {
          let newQuestion = [];
          obj.questions.map(ques => {
            if (ques.qus_no != qus_no) {
              newQuestion.push(ques)
            }
          });
          obj.questions = newQuestion;
          console.log(newQuestion);

          newArr.push(obj);
        } else {
          tmp.push(obj);
        }
      });

      setSection([...newArr]);
    }

    // let newArr = [];
    // let tmp = [];

    // tmp = JSON.parse(JSON.stringify(section))

    // if (window.confirm('Are you sure you want to delete ?')) {
    // tmp.map(obj => {
    //   if (obj.sec_no == sec_no) {
    //     let l_sec = obj;
    //     let x = [];
    //     obj.questions.map(ques => {
    //       if (ques.qus_no != qus_no) {
    //         x.push(ques)
    //       }

    //     });
    //     l_sec.questions = x;
    //     tmp.push(l_sec);

    //   } else {
    //     tmp.push(obj);
    //   }
    // });

    // console.log("??", tmp);

    // setSection(tmp)
    // setSection([...newArr]);
    // }
    // let newArr = [];
    // let tmp = [];
    // let sec = JSON.parse(JSON.stringify(section))
    // // if (window.confirm('Are you sure you want to delete ?')) {
    //   sec.map(obj => {
    //     if (obj.sec_no == sec_no) {
    //       let l_sec = obj;
    //       let x=[];
    //       let seq=1;

    //        let xyz=mySort(obj.questions);
    //       console.log("xyz...",xyz)
          
    //        xyz.map(ques => {
    //           if (ques.qus_no != qus_no) {
    //             console.log("::",ques,seq)
    //             ques.serial_no=seq;
    //            x.push(ques);
    //            seq++;
    //           }
             

    //         });
    //         l_sec.questions=x;
    //        tmp.push(l_sec);
          
    //     } else {
    //       tmp.push(obj);
    //     }
    //   });

    //   setSection([...tmp]);
      // let x=!render;
      // setRender([...x])
  }

  const deleteAll = () => {
    const obj = {
      id: "",
      name: "",
      description: "",
    }
    closeDeleteModalbtn.current.click();   
    if (tool.id != "") {
      fetchData(admin_url.QUESTIONNAIREDELETE + tool.id, "delete")
      .then((res) => {
      })
      .catch((error) => {
        console.log(error);
      });
    }
    setTool(obj);
    setSection([])
    history.push("/admin-panel/questionaire");
  }

  return (
    <>
      <section className="default_content_page">
        <input type="hidden" id='sortable_val' />
        <button onClick={addQuestionSerialNo} id="indexClick" style={{ display: "none" }}></button>
        <div className="conty_top_section conty_top_section_sticky">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="admin_control_top_button_ar">
                <span>
                    <button className="btn_gen_wc bg_gr color_white opacity04"><img src="images/copy.svg" alt="" /> Preview</button>
                  </span>
                  <span>
                    <button className="btn_gen_wc bg_red color_white" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete tool</button>
                  </span>
                  <span>
                    <button className="btn_gen_wc bg_blue_lite color_white" onClick={getLink}><img src="images/link.svg" alt="" /> Get link</button>
                    <button className="btn_gen_wc bg_blue_lite color_white ms-1"  onClick={save}>Save</button>
                    <button className="btn_gen_wc bg_blue_lite color_white ms-1" onClick={publish}> Publish</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="conty_main">
          <div className="container">
            <div className="admin_cr_main_section">
              <div className="row">
                <div className="col-md-12">
                  <div className="admin_cr_gen_block padbot50">
                    <div className="admin_cr_white_block admin_cr_title_block">
                      <div className="mb-3">
                        <input type="text" className="form-control admin_cr_tool_title_input" placeholder="Tool title" onChange={(e) => handleToolName(e.target.value)} />
                      </div>
                      <div className="mb-3">
                        <textarea className="form-control admin_cr_tool_title_txtar" rows="3" placeholder="Tool description, this will appear on the first screen..."
                          onChange={(e) => handleToolDes(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                    <span className="admin_cr_tool_add_btn_ar">
                      <Link to="#" className="admin_cr_tool_add_btn" onClick={() => setSectionToggle(!sectionToggle)}>
                        <img src="images/add_round.svg" alt="" />
                      </Link>
                      <div className="admin_cr_tool_add_pop" style={{ display: sectionToggle ? 'block' : 'none' }}>
                        <button className="btn_pop" onClick={addSection}>
                          <img src="images/add_section.svg" alt="" /> Add Section
                        </button>
                      </div>
                    </span>
                  </div>
                  {section.map((section, i) => {
                    if (section.questions.length > 0) {
                      // section.questions = sortQuestion(section.questions);
                    }
                    return (
                      <div className="admin_cr_gen_block padbot12 padlr50" key={i}>
                        <div className="admin_cr_white_block admin_cr_section_header_block">
                          <p className="admin_cr_section_header_heading">Section</p>
                          <div className="mb-3">
                            <input type="text" className="form-control admin_cr_tool_header_title_input" placeholder="Section title..." onChange={(e) => handleSecTitle(e.target.value, section.sec_no)} />
                          </div>
                          <div className="mb-3">
                            <textarea className="form-control admin_cr_tool_title_txtar" rows="3" placeholder="Section description..." onChange={(e) => handleSecDesc(e.target.value, section.sec_no)}></textarea>
                          </div>
                          <div className="delete_btn_ar">
                            <Link to="#"><img src="images/delete.svg" alt="" onClick={() => deleteSection(section.sec_no)} /></Link>
                          </div>
                        </div>
                        {
                          section.questions.length > 0 &&
                          <div id={'sortable_' + section.sec_no}>
                            {
                              // < Question questions={section.questions} sec_no={section.sec_no}/>
                              section.questions.map((ques, index) => (

                                <div className="admin_cr_white_block admin_cr_section_question_block mt-3" key={index} data={section.sec_no + "_" + ques.qus_no}>
                                  <Link className="drag_icon" to="#" >
                                    <img src="images/drag_dot.svg" alt="" />
                                  </Link>
                                  <p className="admin_cr_section_header_heading">Question</p>
                                  <div className="mb-3">
                                    <input value={ques.title} type="text" className="form-control admin_cr_tool_header_title_input" placeholder="Question title..." onChange={(e) => handleQustitle(e.target.value, section.sec_no, ques.qus_no)} />
                                  </div>
                                  <div className="mb-3">
                                    <label className="admin_cr_tool_question_heading">1</label>
                                    <textarea value={ques.left_ques} className="form-control admin_cr_tool_question_txtar" rows="3" placeholder="Question description..."
                                      onChange={(e) => handleLeft(e.target.value, section.sec_no, ques.qus_no)}
                                    ></textarea>
                                  </div>
                                  <div className="mb-3">
                                    <label className="admin_cr_tool_question_heading">5</label>
                                    <textarea value={ques.right_ques} className="form-control admin_cr_tool_question_txtar" rows="3" placeholder="Question description..."
                                      onChange={(e) => handleRight(e.target.value, section.sec_no, ques.qus_no)}
                                    ></textarea>
                                  </div>
                                  <div className="delete_btn_ar">{ques.serial_no}
                                    <Link to="#"><img src="images/delete.svg" alt="" onClick={() => deleteQuestion(section.sec_no, ques.qus_no)} />{section.sec_no, ques.qus_no}</Link>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        }
                        <span className="admin_cr_tool_add_btn_ar">
                          <Link to="#" className="admin_cr_tool_add_btn" onClick={() => setThisQuesToggle(section.sec_no)}>
                            <img src="images/add_round.svg" alt="" />
                          </Link>
                          <div className="admin_cr_tool_add_pop" style={{ display: section.quesToggleMode ? 'block' : 'none' }}>
                            <button className="btn_pop" onClick={() => addQuestion(section.sec_no)}>
                              <img src="images/add_section.svg" alt="" /> Add Question
                            </button>
                          </div>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="pub_section_div"></div>
            <div className="admin_cr_tool_bottom_section_bs">
              <div className="row">
                <div className="col-md-12">
                  <div className="admin_cr_tool_bottom_section padlr50 mb-5">
                    <h2 className="conty_heading mt-3">Recommendations</h2>
                    <p>This is the area where you can add recommendations that will appear at the end of
                      the tool, these can only be added once you have built the questionnaire and
                      pressed save.</p>
                    <div className="admin_cr_white_block admin_cr_section_question_block mt-3">
                      <div className="mb-3">
                        <input type="text" className="form-control admin_cr_tool_header_title_input" placeholder="Section title..." />
                      </div>
                      <div className="mb-3">
                        <select className="form-select admin_cr_tool_selct"
                          aria-label="Default select example">
                          <option defaultValue>Open this select menu</option>
                          <option value="1">One</option>
                          <option value="2">Two</option>
                          <option value="3">Three</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Modal button  */}
      <button className='d-none' ref={msgModalBtn} data-bs-toggle="modal" data-bs-target="#acmSave"  >Save</button>
      <button ref={getLinkModalBtn} className='d-none' data-bs-toggle="modal" data-bs-target="#getLink">Get link</button>
      {/* <!-- Modal --> */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="acm_close_ar">
            <button type="button" ref={closeDeleteModalbtn} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p className="acm_modal_heading">Delete tool?</p>
              <p className="acm_modal_txt">Are you sure you want to delete the tool: Growth diagnostic tool?</p>
              <p className="acm_modal_txt">Once deleted the URL link will no longer be accessible to anyone who may be using it.</p>
              <div className="acm_modal_footer_btn">
                <button data-bs-dismiss="modal" aria-label="Close" className="btn_gen_wc bg_blue_lite color_white"><img src="images/back.svg" alt="" /> Go Back</button>
                <button className="btn_gen_wc bg_red color_white ms-1" onClick={deleteAll}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="getLink" tabIndex="-1" aria-labelledby="" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="acm_close_ar">
              <button ref={closeGetModalBtn} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p className="acm_modal_heading">Tool link:<br />{tool.name}</p>
              <div className="acm_modal_gen_block">
                <label className="acm_modal_frm_heading">URL Link</label>
                <input type="text" className="form-control cm_modal_gen_input" placeholder="https://www.figma.com/proto/rNO3FgADLaDkw" defaultValue={url} />
              </div>
              <div className="acm_modal_footer_btn">
                <button onClick={copyLink} className="btn_gen_wc bg_blue_lite color_white"><img className="mr5" src="img/copy.svg" alt="" /> Copy link</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="acmSave" tabIndex="-1" aria-labelledby="" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="acm_close_ar">
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="acm_modal_gen_block acm_modal_single_txt_block">
                <p className="acm_modal_sub_heading">{msg} </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
