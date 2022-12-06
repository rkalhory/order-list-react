import React, {useState,useEffect} from 'react'
import {Select, Text, Button, TreeSelect, Checkbox} from "../../../components/utils/field";
import {Form, message, Spin} from "antd";
import {useHistory} from "react-router-dom";
import axios from "../../../services/Axios";
import {Helmet} from "react-helmet";
import MainTopTitle from "../../../components/utils/mainTopTitle";
import {clearSession} from "../../../utils/clearSession";
import {createTree,searchTree} from "../../../utils/funcTree";
import {
    getBaseMenuByParent,
    getAllTextContentType,
    getAllBaseContentDetailTypeId,
    getLang, getMenuByParentParentId
} from "../../../services/getList";
// import Nestable from 'react-nestable';
import OrderList from './OrderList'


const customData = require('../../../utils/values.json');

function Add() {

    const typeOption=customData?.typeOption

    const history=useHistory()

    const [loading,setLoading]=useState(false)
    const [loadRef,setLoadRef]=useState(false)
    const [loadParent,setLoadParent]=useState(false)
    const [loadtreeDataRaw,setLoadTreeDataRaw]=useState(false)

    const [treeDataRaw ,setTreeDataRaw ]=useState([])
    const [treeData ,setTreeData ]=useState([])

    const [referenceOption ,setReferenceOption ]=useState([])

    // const [personListId,setPersonListId]=useState([])
    // const [personList,setPersonList]=useState([])

    const [typeId ,setTypeId]=useState(43)
    const [parentPriority ,setParentPriority]=useState()

    const [langId,setLangId]=useState(1);
    const [langOption,setLangOption]=useState([])

    const [form] = Form.useForm();



    useEffect(()=>{
        dataType()
        const dataLang = async ()=>{
            const dataL=await getLang()
            setLangOption(dataL)
        }
        dataLang()
        clearSession()
    },[])


    function onFocusInput(itemClass){
        document.querySelector(`.${itemClass} .ant-form-item-label`).style.display = "none";
    }

    function onBlurInput(e,itemClass){
        if(e.target.value===''){
            document.querySelector(`.${itemClass} .ant-form-item-label`).style.display = "block";
        }
    }

    // useEffect(()=>{
    //     if(personList.length!==0) {
    //         if(document.querySelector('.reason-block'))document.querySelector('.reason-block').classList.remove("has-error")
    //         if(document.querySelector('.reason-block'))document.querySelector('.reason-block .ant-form-item-explain.ant-form-item-explain-error').style.display = "none";
    //     }else{
    //         if(document.querySelector('.reason-block'))document.querySelector('.reason-block').classList.add("has-error")
    //         if(document.querySelector('.reason-block'))document.querySelector('.reason-block .ant-form-item-explain.ant-form-item-explain-error').style.display = "block";
    //     }
    // },[personList])

    function submitForm(values) {
        let error=false
        let errorMsg=''
        // if (typeId===24&&personListId.length===0&&personList.length===0){
        //     document.querySelector('.reason-block').classList.add("has-error")
        //     document.querySelector('.reason-block .ant-form-item-explain.ant-form-item-explain-error').style.display = "block";
        // }else{
        //
        //     if(document.querySelector('.reason-block')){
        //         document.querySelector('.reason-block').classList.remove("has-error")
        //         document.querySelector('.reason-block .ant-form-item-explain.ant-form-item-explain-error').style.display = "none";
        //     }
        setLoading(true)
            let apiData={
                Title: values?.title,
                ParentId: values?.parentId||'',
                // Priority: parseInt(`${parentPriority||''}${values?.priority}`),
                PageUrl:values.pageUrl||'',
                IsPublish: !!values?.publish,
                TypeId: typeId,
                Reference: values?.reference&&[values?.reference]
            }
            let url=''
            if (langId===1){
                url='Menu/CreateBaseMenu'
            }else{
                url='Menu/CreateMenu'
                apiData.LanguageId=langId
            }
            axios.post(url, apiData)
                .then(res=> {
                    error=false
                })
                .catch(err=> {
                    if(err?.response?.data){
                        errorMsg=err?.response?.data
                        error=true
                    }else if(err){
                        error=true
                        errorMsg=''
                    }else{
                        error=false
                    }
                })
                .finally(()=>{
                    if(!error){
                        message.success('عملیات با موفقیت انجام شد.')
                        form.resetFields()
                        setParentPriority('')
                        setTreeData([])
                        setTypeId('')
                        dataType()
                    }else{
                        !errorMsg?
                            message.error('مشکلی وجود دارد! دوباره تلاش کنید.'):
                            message.error(errorMsg)
                    }
                    setLoading(false)
                })
        }



    // const dataDepartment = async () => {
    //     const getData = await axios('Department/GetAllBaseDepartment');
    //     const convert = getData?.data?.map((p) => ({
    //         value: p?.Id,
    //         label: p?.TitleObject?.Body||''
    //     }));
    //     return convert
    // };

    const dataReferenceType = async (num) => {
        let getData
        if(num===1) getData = await getAllTextContentType();
        if(num===2) getData = await getAllBaseContentDetailTypeId(typeId);
        // if(num===3) getData = await GetAllBasePerson();
        // if(num===4) getData = await dataDepartment();
        setLoadRef(false)
        setReferenceOption(getData)
    };

    useEffect(()=>{
        form.setFieldsValue({
            reference:null
        })
        // setPersonList([])
        // setPersonListId([])
        if(typeId===13||typeId===14||typeId===15) {
            setLoadRef(true)
            dataReferenceType(1)
        }else if(typeId===22){
            setLoadRef(true)
            dataReferenceType(2)
        // }else if(typeId===24||typeId===25){
        //     setLoadRef(true)
        //     dataReferenceType(3)
        // }else if(typeId===23){
        //     setLoadRef(true)
        //     dataReferenceType(4)
        }
    },[typeId])

    function listAdd(v,option,listId,setListId,list,setList){
        if(!listId.includes(v)){
            let filter=option.filter(item=>item.value===v)
            let temp={
                label:filter[0].label,
                value:filter[0].value,
            }
            setList([...list,temp])
            setListId([...listId,v])
        }
    }

    function removeList(value,listId,setListId,list,setList){
        setListId(listId.filter(item => item !== value))
        setList(list.filter(item => item?.value !== value))
    }

    useEffect(()=>{
        if(langId){
            dataType()
            form.setFieldsValue({
                parentId:null
            })
        }
    },[langId])

    const dataType = async () => {
        setLoadParent(true)
        setLoadTreeDataRaw(true)
        let gData=[]
        if(langId===1){
            gData = await getBaseMenuByParent();
        }else{
            gData = await getMenuByParentParentId(langId);
        }
        setTreeDataRaw(gData)
        const convert = gData?.map((p) => createTree(p,1));
        setTreeData(convert)
        setParentPri('')
        form.setFieldsValue({
            parentId:null,
            priority:''
        })
        setLoadParent(false)
        setLoadTreeDataRaw(false)
    };

    function setParentPri(id) {
        let res=searchTree(treeData, id)
        setParentPriority(res?.value)
    }

    return(
        <div className='page-content'>
            <Helmet><title>وب سایت-افزودن</title></Helmet>
            <MainTopTitle
                title={'افزودن'}
                icon={
                    <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.375 2.6C2.13439 2.6 2.75 2.01797 2.75 1.3C2.75 0.58203 2.13439 0 1.375 0C0.615608 0 0 0.58203 0 1.3C0 2.01797 0.615608 2.6 1.375 2.6ZM5.5 1.3C5.5 0.941015 5.8078 0.65 6.1875 0.65H21.3125C21.6922 0.65 22 0.941015 22 1.3C22 1.65899 21.6922 1.95 21.3125 1.95H6.1875C5.8078 1.95 5.5 1.65899 5.5 1.3ZM5.5 6.5C5.5 6.14101 5.8078 5.85 6.1875 5.85H21.3125C21.6922 5.85 22 6.14101 22 6.5C22 6.85898 21.6922 7.15 21.3125 7.15H6.1875C5.8078 7.15 5.5 6.85898 5.5 6.5ZM11.6875 11.05C11.3078 11.05 11 11.341 11 11.7C11 12.059 11.3078 12.35 11.6875 12.35H21.3125C21.6922 12.35 22 12.059 22 11.7C22 11.341 21.6922 11.05 21.3125 11.05H11.6875ZM8.25 11.7C8.25 12.418 7.63439 13 6.875 13C6.11561 13 5.5 12.418 5.5 11.7C5.5 10.982 6.11561 10.4 6.875 10.4C7.63439 10.4 8.25 10.982 8.25 11.7ZM1.375 7.8C2.13439 7.8 2.75 7.21797 2.75 6.5C2.75 5.78203 2.13439 5.2 1.375 5.2C0.615608 5.2 0 5.78203 0 6.5C0 7.21797 0.615608 7.8 1.375 7.8Z" fill="#1F88D9"/>
                    </svg>
                }
            />
            <Form
                name="add-menu"
                onFinish={submitForm}
                form={form}
                initialValues={{
                    lang:langId
                }}
            >
                <div className='content-box position-relative'>
                    {loading&&<div style={{position:'absolute',inset:'0',background:'rgba(255,255,255,.6)',zIndex:'10',display:'flex',alignItems:'center',justifyContent:'center'}}><Spin/></div>}
                    <div className='content'>
                        <div className='row-3'>
                            <div className='col-33 col-s-100 h-65 label-title'>
                                <Text
                                    label="عنوان"
                                    name="title"
                                    className='abs-label'
                                    onFocus={() => onFocusInput('label-title')}
                                    onBlur={(e) => {
                                        onBlurInput(e, 'label-title')
                                    }}
                                    required={true}
                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                />
                            </div>
                            <div className='col-33 col-s-50 h-65 position-relative'>
                                {loadParent&&<div style={{position:'absolute',inset:'0',height:'43px',background:'rgba(255,255,255,.6)',zIndex:'5', display:'flex',alignItems:'center',justifyContent:'center'}}><Spin/></div>}
                                <TreeSelect
                                    label='عنوان اصلی'
                                    name='parentId'
                                    allowClear
                                    treeData={treeData}
                                    onChange={e=>setParentPri(e)}
                                />
                            </div>
                            <div className='col-33 col-s-50 h-65 label-priority'>
                                <Select
                                    label="زبان"
                                    name="lang"
                                    placeholder="زبان"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange={v=>setLangId(v)}
                                    options={langOption}
                                />
                            </div>
                            <div className='col-100 col-s-100 h-65'>
                                <Text
                                    label="آدرس صفحه"
                                    notLabel
                                    name="pageUrl"
                                    className='abs-label'
                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                />
                            </div>
                            {/*<div className='col-33 col-s-50 h-65'>*/}
                            {/*    <Checkbox*/}
                            {/*        label="زیر گروه ندارد"*/}
                            {/*        className='bg-blue'*/}
                            {/*        name="hasChild"*/}
                            {/*        onChange={e=>setHasChild(e.target.checked)}*/}
                            {/*    />*/}
                            {/*</div>*/}
                            <div className='col-33 col-s-50 h-65'>
                                <Checkbox
                                    label="انتشار"
                                    className='bg-blue'
                                    name="publish"
                                />
                            </div>
                            <div className='col-33 col-s-50 h-65 col-s-hide'></div>
                            <div className='col-100 h-65 label-mw-60'>
                                <Select
                                    label="نوع"
                                    name="type"
                                    showSearch
                                    allowClear
                                    required={true}
                                    placeholder="نوع را انتخاب نمایید"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange={(value) => {
                                        setTypeId(value)
                                        form.setFieldsValue({
                                            reference:null
                                        })
                                    }}
                                    options={typeOption}
                                />
                            </div>
                            {(typeId!==26&&typeId!==43)&&(
                                loadRef?<div style={{marginTop:'10px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%'}}><Spin/></div>:<>
                                        {referenceOption.length!==0&&<div className='col-100 h-65 label-mw-60'>
                                            <Select
                                                label="مرجع"
                                                name="reference"
                                                showSearch
                                                allowClear
                                                required={true}
                                                placeholder="مرجع را انتخاب نمایید"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                options={referenceOption}
                                            />
                                        </div>}
                                        {/*{referenceOption.length!==0&&typeId===24&&<div className='col-100 label-mw-60 d-flex'>*/}
                                        {/*    <div className='multi-select flex-grow-1'>*/}
                                        {/*    <Select*/}
                                        {/*        label="مرجع"*/}
                                        {/*        name="reference"*/}
                                        {/*        showSearch*/}
                                        {/*        allowClear*/}
                                        {/*        placeholder="مرجع را انتخاب نمایید"*/}
                                        {/*        optionFilterProp="children"*/}
                                        {/*        filterOption={(input, option) =>*/}
                                        {/*            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0*/}
                                        {/*        }*/}
                                        {/*        onSelect={(v) => listAdd(v, referenceOption, personListId, setPersonListId, personList, setPersonList)}*/}
                                        {/*        options={referenceOption}*/}
                                        {/*    />*/}
                                        {/*    <div className={`reason-block position-relative normal ${personList.length && 'has-child'}`}>*/}
                                        {/*        {personList.map((item) => (*/}
                                        {/*            <div key={item?.value} className='item'>*/}
                                        {/*                <span className='text'>{item?.label}</span>*/}
                                        {/*                <span className='action-btn remove-btn'*/}
                                        {/*                      onClick={() => removeList(item?.value, personListId, setPersonListId, personList, setPersonList)}>*/}
                                        {/*        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"*/}
                                        {/*             xmlns="http://www.w3.org/2000/svg">*/}
                                        {/*            <path*/}
                                        {/*                d="M5.20644 1.21999C5.46311 0.774987 5.96644 0.489987 6.48144 0.504987C7.48977 0.49332 8.49977 0.496654 9.50811 0.501654C10.1514 0.47332 10.7648 0.931654 10.9398 1.54665C11.0098 1.85999 10.9981 2.18165 11.0114 2.49999C12.3448 2.50665 13.6764 2.48832 15.0081 2.50499C15.4948 2.46332 15.6998 3.18665 15.2814 3.42332C14.8714 3.58499 14.3998 3.47165 13.9664 3.49999C13.6564 7.04999 13.3814 10.605 13.0681 14.155C13.0248 14.935 12.2848 15.5533 11.5148 15.5C9.17311 15.5 6.83144 15.5 4.48977 15.5C3.71977 15.555 2.97977 14.94 2.93311 14.1617C2.61811 10.61 2.34477 7.05332 2.03311 3.49999C1.59977 3.47332 1.13311 3.58165 0.72144 3.42499C0.299774 3.19332 0.50144 2.46665 0.988107 2.50499C2.31977 2.48832 3.65477 2.50665 4.98811 2.49999C5.01311 2.06999 4.95644 1.59832 5.20644 1.21999ZM6.33977 1.52665C5.94144 1.68665 6.00144 2.15165 5.98477 2.49999C7.32811 2.49999 8.67144 2.49999 10.0148 2.49999C9.99644 2.15165 10.0598 1.68165 9.65477 1.52665C8.55311 1.47999 7.44144 1.47999 6.33977 1.52665ZM3.04144 3.49999C3.33811 6.95165 3.61811 10.405 3.90811 13.8567C3.88644 14.1967 4.12811 14.5417 4.49811 14.495C6.83477 14.5033 9.17311 14.5033 11.5098 14.495C11.8764 14.5383 12.1114 14.1917 12.0914 13.8567C12.3814 10.4033 12.6614 6.95165 12.9581 3.49999C9.65311 3.49999 6.34644 3.49999 3.04144 3.49999Z"*/}
                                        {/*                fill="#ED4C67"/>*/}
                                        {/*            <path*/}
                                        {/*                d="M6.2213 6.07504C6.51796 5.83837 7.02463 6.10004 6.99463 6.48337C6.99463 8.20837 7.02296 9.93837 6.97963 11.6634C6.8413 12.19 5.96796 12.07 6.00463 11.5167C5.9863 9.95671 6.0113 8.39671 5.99463 6.83671C6.00296 6.57171 5.95296 6.23504 6.2213 6.07504Z"*/}
                                        {/*                fill="#ED4C67"/>*/}
                                        {/*            <path*/}
                                        {/*                d="M9.21648 6.07817C9.50981 5.8365 10.0198 6.0965 9.99481 6.4765C10.0048 8.15984 10.0048 9.84317 9.99481 11.5265C10.0215 12.0748 9.14981 12.1865 9.01981 11.6598C8.96648 10.1032 9.02148 8.54484 8.99481 6.98817C9.01981 6.68317 8.90814 6.27484 9.21648 6.07817Z"*/}
                                        {/*                fill="#ED4C67"/>*/}
                                        {/*        </svg>*/}
                                        {/*    </span>*/}
                                        {/*            </div>*/}
                                        {/*        ))}*/}
                                        {/*        <div className="ant-form-item-explain ant-form-item-explain-error" style={{display:'none'}}>*/}
                                        {/*            <div role="alert">مرجع اجباری است!</div>*/}
                                        {/*        </div>*/}
                                        {/*    </div>*/}
                                        {/*</div></div>}*/}
                                    </>
                            )}
                        </div>
                    </div>
                    <div className='d-flex justify-content-end'>
                        <div className='d-flex justify-content-end action-btn-block mt-20 text-right'>
                            {/*<Button*/}
                            {/*    label={'انصراف'}*/}
                            {/*    className='border-btn m-0 w-90'*/}
                            {/*    type="primary"*/}
                            {/*    htmlType="button"*/}
                            {/*    onClick={()=>history.push('/web-site/menu')}*/}
                            {/*/>*/}
                            <Button
                                label={'افزودن'}
                                className='green-btn m-0 w-90'
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={loading}
                                // onClick={()=>{
                                //     if (typeId===24&&personListId.length===0&&personList.length===0){
                                //         document.querySelector('.reason-block').classList.add("has-error")
                                //         document.querySelector('.reason-block .ant-form-item-explain.ant-form-item-explain-error').style.display = "block";
                                //     }
                                // }}
                            />
                        </div>
                    </div>
                </div>

            </Form>
            {loadtreeDataRaw?<div style={{padding:'40px 0',zIndex:'5', display:'flex',alignItems:'center',justifyContent:'center'}}><Spin/></div>:
                <OrderList data={treeDataRaw} dataType={dataType} langId={langId}/>}
        </div>
    )
}

export default Add

