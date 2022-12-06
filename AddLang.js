import {useState, useEffect} from 'react'
import {Select, Text, Button, TreeSelect, Checkbox} from "../../../components/utils/field";
import {Form, message, Modal, Spin, Tooltip} from "antd";
import {useHistory} from "react-router-dom";
import {
    getAllContentDetailLang,
    GetAllPersonLang,
    getAllTextContentType,
    getMenuByParentParentId,
    getLang,dataDepartmentLang
} from "../../../services/getList";
import {Helmet} from "react-helmet";
import MainTopTitle from "../../../components/utils/mainTopTitle";
import axios from "../../../services/Axios";
import Table from "../../../components/utils/table";
import {clearSession} from "../../../utils/clearSession";
import {createTree, searchTree} from "../../../utils/funcTree";
import EditMenuLang from '../../components/modals/EditMenuLang'


const customData = require('../../../utils/values.json');

function AddLang() {

    const history=useHistory()

    const typeOption=customData?.typeOption

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const [loading,setLoading]=useState(false)
    const [loadPage,setLoadPage]=useState(false)
    const [loadParent,setLoadParent]=useState(false)

    const [langOptionValue,setLangOptionValue]=useState([])
    const [langOption,setLangOption]=useState([])
    const [langId,setLangId]=useState()

    const [itemId, setItemId] = useState(0);
    const [itemLang, setItemLang] = useState('');
    const [editModal,setEditModal]=useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [loadRef,setLoadRef]=useState(false)
    const [treeData ,setTreeData ]=useState([])

    const [referenceOption ,setReferenceOption ]=useState([])

    const [parentPriority ,setParentPriority]=useState()

    const [typeId ,setTypeId]=useState(parseInt(params?.type))

    const [data,setData]=useState([])

    const [editRecord,setEditRecord]=useState({
        Id:'',
        langId:''
    })


    const [form] = Form.useForm();


    function getData(){
        setLoading(true)
        axios.get(`Menu/GetAllMenu?BaseMenuId=${params?.id}`
        )
            .then(res=> {
                if(res?.data?.data?.length===0||!Object.keys(res?.data?.data).length){
                    setData([])
                }else {
                    setData(res?.data?.data)
                }

            })
            .catch(err=> {
                if(parseInt(err?.response?.status) === 404) {
                    setData([])
                }
            })
            .finally(()=>setLoading(false))

    }

    const dataType = async (langId) => {
        const getData = await getMenuByParentParentId(langId);
        const convert = getData?.map((p) => createTree(p,1));
        setTreeData(convert)
        setParentPri('')
        form.setFieldsValue({
            parentId:null,
            priority:null
        })
        setLoadParent(false)
    };

    useEffect(()=>{
        const dataLang = async ()=>{
            const dataL=await getLang()
            setLangOptionValue(dataL)
        }
        dataLang()
        getData()
        clearSession()
        if(params.id){
            setLoadPage(true)
        }else {
            message.error('محتوای مورد نظر را انتخاب کنید!')
            history.push('/web-site/menu')
        }
    },[])

    useEffect(()=>{
        if(langId){
            setLoadParent(true)
            dataType(langId)
        }
    },[langId])

    useEffect(()=>{
        let temp
        if(langOptionValue.length){
            temp=langOptionValue.filter(item=>item.label!=='فارسی')
        }
        setLangOption(temp)
    },[langOptionValue])


    function onFocusInput(itemClass){
        document.querySelector(`.${itemClass} .ant-form-item-label`).style.display = "none";
    }

    function onBlurInput(e,itemClass){
        if(e.target.value===''){
            document.querySelector(`.${itemClass} .ant-form-item-label`).style.display = "block";
        }
    }



    function submitForm(values){
        let error=false
        let errorMsg=''

            setLoading(true)

            axios.post('Menu/CreateMenu', {
                BaseMenuId: parseInt(params.id),
                LanguageId: values?.lang,
                Title: values?.title,
                ParentId: values?.parentId,
                PageUrl:values.pageUrl||'',
                IsPublish: !!values?.publish,
                TypeId: typeId||'',
                Reference: values?.reference && [values?.reference]
            })
                .then(res => {
                    error = false
                })
                .catch(err => {
                    if (err?.response?.data) {
                        errorMsg = err?.response?.data
                        error = true
                    } else if (err) {
                        error = true
                        errorMsg = ''
                    } else {
                        error = false
                    }
                })
                .finally(() => {
                    if (!error) {
                        message.success('عملیات با موفقیت انجام شد.')
                        form.resetFields()
                        setParentPriority('')
                        setTreeData([])
                        getData()
                    } else {
                        !errorMsg?
                            message.error('مشکلی وجود دارد! دوباره تلاش کنید.') :
                            message.error(errorMsg)
                    }
                    setLoading(false)
                })

    }


    const columns = [
        {
            title: 'ردیف',
            key: 'Id',
            render : (text, record, index) => index+1
        },
        {
            title: 'عنوان',
            key: 'Title',
        },
        {
            title: 'عنوان اصلی',
            key: 'BaseMenuTitle',
            // render:(field,record)=>field?.Title
        },
        {
            title: 'نوع',
            key: 'Type',
            render:(field,record)=>field?.Title
        },
        {
            title: 'زبان',
            key: 'Language',
            render:(field,record)=> field?.Title
        },
        {
            title: '',
            key: 'action',
            render: (f,r) => (
                <div className='action-part'>
                    <Tooltip title="حذف">
                        <button className='action-btn remove-btn' onClick={()=>showModal(r.Id,r?.Language?.Title)}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.20644 1.21999C5.46311 0.774987 5.96644 0.489987 6.48144 0.504987C7.48977 0.49332 8.49977 0.496654 9.50811 0.501654C10.1514 0.47332 10.7648 0.931654 10.9398 1.54665C11.0098 1.85999 10.9981 2.18165 11.0114 2.49999C12.3448 2.50665 13.6764 2.48832 15.0081 2.50499C15.4948 2.46332 15.6998 3.18665 15.2814 3.42332C14.8714 3.58499 14.3998 3.47165 13.9664 3.49999C13.6564 7.04999 13.3814 10.605 13.0681 14.155C13.0248 14.935 12.2848 15.5533 11.5148 15.5C9.17311 15.5 6.83144 15.5 4.48977 15.5C3.71977 15.555 2.97977 14.94 2.93311 14.1617C2.61811 10.61 2.34477 7.05332 2.03311 3.49999C1.59977 3.47332 1.13311 3.58165 0.72144 3.42499C0.299774 3.19332 0.50144 2.46665 0.988107 2.50499C2.31977 2.48832 3.65477 2.50665 4.98811 2.49999C5.01311 2.06999 4.95644 1.59832 5.20644 1.21999ZM6.33977 1.52665C5.94144 1.68665 6.00144 2.15165 5.98477 2.49999C7.32811 2.49999 8.67144 2.49999 10.0148 2.49999C9.99644 2.15165 10.0598 1.68165 9.65477 1.52665C8.55311 1.47999 7.44144 1.47999 6.33977 1.52665ZM3.04144 3.49999C3.33811 6.95165 3.61811 10.405 3.90811 13.8567C3.88644 14.1967 4.12811 14.5417 4.49811 14.495C6.83477 14.5033 9.17311 14.5033 11.5098 14.495C11.8764 14.5383 12.1114 14.1917 12.0914 13.8567C12.3814 10.4033 12.6614 6.95165 12.9581 3.49999C9.65311 3.49999 6.34644 3.49999 3.04144 3.49999Z" fill="#ED4C67"/>
                                <path d="M6.2213 6.07504C6.51796 5.83837 7.02463 6.10004 6.99463 6.48337C6.99463 8.20837 7.02296 9.93837 6.97963 11.6634C6.8413 12.19 5.96796 12.07 6.00463 11.5167C5.9863 9.95671 6.0113 8.39671 5.99463 6.83671C6.00296 6.57171 5.95296 6.23504 6.2213 6.07504Z" fill="#ED4C67"/>
                                <path d="M9.21648 6.07817C9.50981 5.8365 10.0198 6.0965 9.99481 6.4765C10.0048 8.15984 10.0048 9.84317 9.99481 11.5265C10.0215 12.0748 9.14981 12.1865 9.01981 11.6598C8.96648 10.1032 9.02148 8.54484 8.99481 6.98817C9.01981 6.68317 8.90814 6.27484 9.21648 6.07817Z" fill="#ED4C67"/>
                            </svg>
                        </button>
                    </Tooltip>
                    <Tooltip title="ویرایش">
                        <button className='action-btn edit-btn' onClick={()=>openEdit(r?.Id,r?.Language?.Id)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.1271 0H11.7469C12.9077 0.135625 13.8717 1.10396 14 2.26625V2.82771C13.8687 4.09354 12.7415 4.81833 11.9569 5.68021C9.53604 8.0675 7.1575 10.5015 4.72937 12.8785C3.3425 13.2898 1.92354 13.6077 0.529375 14H0.427292C0.32375 13.8265 0.175 13.6806 0 13.58V13.5115C0.320833 12.2106 0.689792 10.9215 1.00333 9.61771C1.06313 9.16708 1.47146 8.91771 1.75729 8.61292C4.33708 6.0375 6.91542 3.46208 9.485 0.877917C9.92979 0.427292 10.5044 0.118125 11.1271 0ZM10.3235 1.29792C11.1154 2.09562 11.9087 2.89042 12.7079 3.68083C12.9048 3.36292 13.106 3.02604 13.125 2.64104C13.1804 1.84479 12.5796 1.08354 11.8052 0.917292C11.2787 0.77 10.7508 1.00333 10.3235 1.29792ZM9.1175 2.5375C9.90792 3.31333 10.6852 4.10083 11.4683 4.88396C11.6623 4.69 11.8562 4.49458 12.0502 4.30062C11.2642 3.5175 10.4825 2.73 9.695 1.94833C9.5025 2.14375 9.31 2.34062 9.1175 2.5375ZM2.28229 9.36833C2.68187 9.5375 3.08 9.70813 3.47958 9.87729C5.43375 7.93042 7.38354 5.97771 9.33479 4.025C9.0475 3.74208 8.76167 3.45771 8.47583 3.17479C6.40937 5.23688 4.34437 7.30042 2.28229 9.36833ZM9.97354 4.66521C8.02521 6.61646 6.07104 8.56187 4.12708 10.516C4.29625 10.9156 4.46687 11.3152 4.6375 11.7148C6.70104 9.65125 8.76458 7.59062 10.8252 5.52417C10.5423 5.23688 10.2579 4.95104 9.97354 4.66521ZM1.79812 10.1237C1.54437 11.0629 1.30521 12.005 1.05583 12.9442C1.995 12.6948 2.93708 12.4556 3.87625 12.2019C3.65604 11.7235 3.49562 11.2146 3.22729 10.7596C2.77229 10.5044 2.27208 10.3396 1.79812 10.1237Z" fill="#4E81DC"/>
                            </svg>
                        </button>
                    </Tooltip>
                </div>
            )
        },
    ];

    function openEdit(id,langId) {
        setEditRecord({
            Id:id,
            langId:langId
        })
        setEditModal(true)
    }

    function removeItem() {
        let error=false
        let errMsg=''
        setLoading(true)
        axios.delete(`Menu/DeleteMenu`,{
            data:{
                Id:itemId
            }
        })
            .then(res=> {
                error=false
                errMsg=''
                message.success('عملیات با موفقیت انجام شد.')
            })
            .catch(err=> {
                error=true
                errMsg=err?.response?.data?.message
            })
            .finally(()=> {
                if(error){
                    errMsg === '' ?
                        message.error('مشکلی وجود دارد! دوباره تلاش کنید.') :
                        message.error(errMsg)
                }
                setLoading(false)
                !error&&getData()
            })

    }


    function closeModal(){
        setIsModalVisible(false)
        setEditModal(false)
        document.body.style.overflow = 'visible';
        setEditRecord({
            Id:'',
            Title: '',
            ParentId: '',
            Priority: '',
            IsPublish: '',
            Type: '',
            Reference: [],
            langId:''
        })
    }

    const showModal = (id,lang) => {
        setItemId(id)
        setItemLang(lang)
        setIsModalVisible(true);
    };

    const handleOk = () => {
        removeItem()
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setItemId(0)
        setIsModalVisible(false);
    };



    const dataReferenceType = async (num) => {
        let getData
        if(num===1) getData = await getAllTextContentType();
        if(num===2) getData = await getAllContentDetailLang(langId,typeId);
        // if(num===3) getData = await GetAllPersonLang(langId);
        // if(num===4) getData = await dataDepartmentLang(langId);
        setLoadRef(false)
        setReferenceOption(getData)
    };

    useEffect(()=>{
        form.setFieldsValue({
            reference:null
        })
        if(langId){
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
        }
    },[typeId,langId])

    // function listAdd(v,option,listId,setListId,list,setList){
    //     if(!listId.includes(v)){
    //         let filter=option.filter(item=>item.value===v)
    //         let temp={
    //             label:filter[0].label,
    //             value:filter[0].value,
    //         }
    //         setList([...list,temp])
    //         setListId([...listId,v])
    //     }
    // }
    //
    // function removeList(value,listId,setListId,list,setList){
    //     setListId(listId.filter(item => item !== value))
    //     setList(list.filter(item => item?.value !== value))
    // }

    function setParentPri(id) {
        let res=searchTree(treeData, id)
        setParentPriority(res?.value)
    }


    return(loadPage&&
        (<div className='page-content'>
                <Helmet><title>وب سایت-سایر زبان ها</title></Helmet>
                <MainTopTitle
                    title={'سایر زبان ها'}
                    icon={
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.5627 6.87621C20.3851 6.87621 21.8763 8.2945 21.9927 10.0875L22 10.3135V18.5627C22 20.3851 20.5817 21.8763 18.7887 21.9927L18.5627 22H10.3135C8.49109 22 6.9999 20.5817 6.88352 18.7887L6.87621 18.5627V10.3135C6.87621 8.49109 8.2945 6.9999 10.0875 6.88352L10.3135 6.87621H18.5627ZM18.5627 8.25114H10.3135C9.24151 8.25114 8.36052 9.06907 8.26058 10.1149L8.25114 10.3135V18.5627C8.25114 19.6347 9.06907 20.5157 10.1149 20.6156L10.3135 20.6251H18.5627C19.6347 20.6251 20.5157 19.8071 20.6156 18.7613L20.6251 18.5627V10.3135C20.6251 9.24151 19.8071 8.36052 18.7613 8.26058L18.5627 8.25114ZM14.4381 9.62607C14.7756 9.62607 15.0563 9.86926 15.1145 10.19L15.1256 10.3135L15.1242 13.7507L18.5631 13.7509C18.9428 13.7509 19.2506 14.0587 19.2506 14.4383C19.2506 14.7758 19.0074 15.0565 18.6867 15.1147L18.5631 15.1258L15.1242 15.1256L15.1256 18.5631C15.1256 18.9428 14.8178 19.2506 14.4381 19.2506C14.1006 19.2506 13.8199 19.0074 13.7617 18.6867L13.7506 18.5631L13.7493 15.1256L10.3135 15.1258C9.93386 15.1258 9.62607 14.818 9.62607 14.4383C9.62607 14.1008 9.86926 13.8201 10.19 13.7619L10.3135 13.7509L13.7493 13.7507L13.7506 10.3135C13.7506 9.93386 14.0584 9.62607 14.4381 9.62607ZM14.6609 2.33212L14.7264 2.54853L15.5175 5.5011H14.093L13.3984 2.90439C13.1209 1.86889 12.1028 1.22962 11.0667 1.40377L10.8724 1.44606L2.90439 3.58109C1.86889 3.85855 1.22962 4.87663 1.40377 5.9127L1.44606 6.107L3.58109 14.0751C3.82161 14.9727 4.61864 15.5726 5.5015 15.603L5.50166 16.9787C4.08966 16.95 2.80102 16.0463 2.32475 14.6654L2.25301 14.4309L0.117977 6.46286C-0.353707 4.70251 0.630308 2.89505 2.33212 2.31857L2.54853 2.25301L10.5166 0.117977C12.2036 -0.334053 13.9339 0.550834 14.5825 2.12319L14.6609 2.33212Z" fill="#0078D4"/>
                        </svg>
                    }
                />
                <Form
                    name="add-content"
                    form={form}
                    onFinish={submitForm}
                    initialValues={{
                        type:typeId||null
                    }}
                >
                    <div className='content-box position-relative'>
                        <h2 className='other-lang-title'>{params?.title}</h2>
                        {loading&&<div style={{position:'absolute',inset:'0',background:'rgba(255,255,255,.6)',zIndex:'10',display:'flex',alignItems:'center',justifyContent:'center'}}><Spin/></div>}
                        <div className='content'>
                            <div className='row-3'>
                                <div className='col-100 h-65 label-title'>
                                    <Select
                                        label="زبان"
                                        name="lang"
                                        placeholder="زبان"
                                        required={true}
                                        showSearch
                                        allowClear
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        onChange={(value) => {setLangId(value)}}
                                        options={langOption}
                                    />
                                </div>
                                <div className='col-33 col-s-50 h-65 label-title'>
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
                                    <Text
                                        label="آدرس صفحه"
                                        notLabel
                                        name="pageUrl"
                                        className='abs-label'
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                    />
                                </div>
                                <div className='col-33 col-s-50 h-65'>
                                    <Checkbox
                                        label="انتشار"
                                        className='bg-blue'
                                        name="publish"
                                    />
                                </div>
                                <div className='col-33 col-s-50 h-65'></div>
                                {!!typeId&&<>
                                    <div className='col-100 h-65'>
                                        <Select
                                            label="نوع"
                                            name="type"
                                            showSearch
                                            disabled
                                            allowClear
                                            placeholder="نوع"
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
                                    langId&&typeId!==26&&typeId!==43&&<div className='d-flex w-100 position-relative'>
                                        {loadRef && <div style={{
                                            position: 'absolute',
                                            inset: '0',
                                            zIndex: '5',
                                            height: '43px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%'
                                        }}><Spin/></div>}
                                        <div className='col-100 h-65'>
                                            <Select
                                                label="مرجع"
                                                name="reference"
                                                showSearch
                                                allowClear
                                                required={true}
                                                placeholder="مرجع"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                options={referenceOption}
                                            />
                                        </div>
                                    </div>)}
                                </>}
                            </div>
                        </div>
                    </div>
                    <div className='d-flex justify-content-end'>
                        <div className='d-flex justify-content-between action-btn-block mt-10 text-right'>
                            <Button
                                label={'انصراف'}
                                className='border-btn m-0 w-90'
                                type="primary"
                                htmlType="button"
                                onClick={()=>history.push('/web-site/menu')}
                            />
                            <Button
                                label={'ذخیره و ثبت اطلاعات'}
                                className='green-btn m-0 w-90'
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </Form>
                <MainTopTitle
                    className='mt-50'
                    title={'ﻟﯿﺴﺖ زﺑﺎن‌ﻫﺎی ﺛﺒﺖ ﺷﺪه'}
                    icon={
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.07317 4.80699L8.12679 4.92178L14.2455 20.8742C14.4083 21.2986 14.2028 21.7772 13.7864 21.9431C13.4047 22.0952 12.9784 21.9318 12.7846 21.5766L12.7377 21.4751L11.1607 17.3637L3.36188 17.3639L3.25838 17.3572L1.55619 21.4938C1.3833 21.914 0.908915 22.1118 0.496635 21.9356C0.118713 21.774 -0.0758427 21.3542 0.0275315 20.9617L0.0631972 20.8555L6.62638 4.90313C6.8911 4.25969 7.75202 4.23235 8.07317 4.80699ZM18.4234 0C18.8413 0 19.1866 0.310417 19.2412 0.713161L19.2488 0.825125L19.2485 6.04652L21.1746 6.04736C21.5925 6.04736 21.9378 6.35778 21.9925 6.76052L22 6.87249C22 7.29021 21.6895 7.63544 21.2866 7.69008L21.1746 7.69761L19.2485 7.69677L19.2488 15.6738C19.2488 16.0915 18.9383 16.4368 18.5354 16.4914L18.4234 16.4989C18.0056 16.4989 17.6603 16.1885 17.6056 15.7858L17.5981 15.6738V0.825125C17.5981 0.369421 17.9676 0 18.4234 0ZM7.49065 7.41969L4.01076 15.7134H10.7347L7.49065 7.41969ZM9.62187 0H15.6721C16.0899 0 16.4352 0.310417 16.4899 0.713161L16.4974 0.825125V4.12969C16.4974 6.70913 14.4058 8.80017 11.8256 8.80017C11.3698 8.80017 11.0003 8.43075 11.0003 7.97505C11.0003 7.51934 11.3698 7.14992 11.8256 7.14992C13.4323 7.14992 14.7461 5.89603 14.8412 4.31368L14.8467 4.12969V1.65025H9.62187C9.16604 1.65025 8.79652 1.28083 8.79652 0.825125C8.79652 0.407396 9.10702 0.0621694 9.50988 0.00753247L9.62187 0H15.6721H9.62187Z" fill="#0078D4"/>
                        </svg>
                    }
                />
                <Table
                    pagination={false}
                    columns={columns}
                    data={data}
                    loading={loading}
                    rowKey={'Id'}
                />
                <Modal
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="بله مطمئنم"
                    cancelText="انصراف"
                    closeIcon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.225 0H0.51C2.3775 1.77625 4.16 3.6425 6 5.44875C7.83625 3.64125 9.625 1.785 11.4825 0H11.785C11.765 0.1625 11.8363 0.2375 12 0.225V0.51125C10.2225 2.37625 8.3575 4.16 6.55125 6C8.35875 7.83625 10.215 9.625 12 11.4825V11.785C11.8363 11.765 11.7625 11.8363 11.775 12H11.49C9.6225 10.2225 7.84 8.3575 6 6.55125C4.16375 8.35875 2.375 10.215 0.51875 12H0.215C0.235 11.8363 0.1625 11.7625 0 11.775V11.49C1.77625 9.6225 3.6425 7.84 5.44875 6C3.64125 4.16375 1.785 2.375 0 0.5175V0.215C0.1625 0.235 0.2375 0.1625 0.225 0Z" fill="#0082BE"/>
                    </svg>
                    }
                >
                    <svg width="170" height="164" viewBox="0 0 170 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M57.5332 46.1977C69.6508 44.4418 81.7816 42.7843 93.8948 41C94.5438 43.8449 96.2532 46.4798 98.7898 48.0017C100.453 49.0207 102.407 49.633 104.373 49.5652C104.767 49.563 105.379 49.4821 105.302 50.0703C106.301 57.1704 107.374 64.2596 108.342 71.3641C102.772 71.3947 97.1992 71.3553 91.6288 71.3881C91.2152 71.3837 90.8038 71.3597 90.3946 71.3313C91.9522 70.9267 93.6308 70.5878 95.2258 70.9595C95.25 70.8043 95.2786 70.649 95.3072 70.496C96.6492 70.4019 97.9846 70.2226 99.2958 69.9187C100.592 69.6082 101.936 69.7175 103.243 69.4748C103.229 69.0287 103.216 68.5804 103.203 68.1343C102.371 68.0994 101.529 68.1125 100.721 68.3355C99.1154 68.7575 97.4478 68.8078 95.8044 68.9806C94.5614 69.243 93.3272 69.5863 92.049 69.6191C90.9798 69.63 89.9568 69.9886 88.8942 70.0477C88.3002 70.0783 87.7084 70.157 87.1276 70.2882C85.9066 70.5637 84.6526 70.6118 83.4272 70.8524C82.7188 71.0033 81.9466 70.9267 81.2932 71.281C81.0116 71.3947 80.6992 71.3619 80.4044 71.3772C73.9914 71.3837 67.5762 71.375 61.161 71.3859C59.9158 62.9957 58.6992 54.5989 57.5332 46.1977ZM70.7332 49.5958C68.0778 50.0025 65.407 50.3108 62.7604 50.7591C62.7626 51.1724 62.789 51.5878 62.8396 51.9989C66.5642 51.5375 70.2712 50.9384 73.9914 50.4442C74.6844 50.442 74.416 49.6133 74.4358 49.1803C73.1862 49.1541 71.9652 49.4493 70.7332 49.5958ZM96.856 56.3788C95.6768 56.9736 94.9266 58.1238 94.5482 59.3527C94.1478 59.4883 93.7474 59.6217 93.347 59.7485C93.358 60.0874 93.3712 60.4263 93.3888 60.7675C93.743 60.8003 94.0994 60.8353 94.458 60.8724C94.5174 61.1217 94.5812 61.3732 94.645 61.6246C94.2974 61.734 93.952 61.8499 93.6044 61.9592C93.6462 62.3441 93.7144 62.7289 93.8156 63.1072C94.2314 63.0722 94.6472 63.0416 95.0652 63.0132C96.4204 65.5366 100.229 66.186 102.303 64.1874C102.569 63.6451 101.872 63.2865 101.564 62.9432C100.871 63.3368 100.156 63.8004 99.331 63.8288C98.4488 63.89 97.549 63.4833 97.0474 62.7551C97.67 62.5758 98.3212 62.5234 98.9504 62.3703C99.3706 62.0882 99.3574 61.4978 99.5158 61.0583C98.4356 61.1436 97.3752 61.3907 96.2928 61.4278C96.2796 61.1392 96.2664 60.8506 96.2554 60.5641C97.4346 60.2842 98.6534 60.2383 99.8392 60C99.9558 59.5561 100.07 59.1122 100.171 58.6639C98.924 58.8279 97.6898 59.0925 96.4314 59.1887C96.8912 57.4197 99.0494 57.013 100.6 57.4481C100.752 57.0239 100.9 56.5975 101.045 56.1711C99.7292 55.5217 98.1298 55.7403 96.856 56.3788ZM81.0446 57.9729C75.4104 58.8148 69.7652 59.5779 64.1354 60.4482C64.2014 60.8484 64.274 61.2485 64.3488 61.6509C67.596 61.3404 70.8058 60.7172 74.042 60.3083C79.4584 59.4992 84.8858 58.7623 90.2956 57.916C90.2626 57.5159 90.2318 57.1135 90.1988 56.7134C87.1342 57.0151 84.1004 57.5837 81.0446 57.9729ZM88.0714 61.3863C80.3208 62.5409 72.5526 63.5883 64.8086 64.7734C64.8306 65.1649 64.857 65.5563 64.8834 65.9477C65.2926 65.9477 65.7018 65.9433 66.1066 65.8755C74.3786 64.6422 82.6726 63.527 90.938 62.2588C90.916 61.8695 90.8918 61.4825 90.8698 61.0933C89.926 61.067 88.9998 61.2551 88.0714 61.3863ZM72.6978 68.0272C70.2778 68.4164 67.8314 68.6482 65.4224 69.1118C65.4488 69.5098 65.4884 69.9077 65.5412 70.3057C67.1824 70.2029 68.7994 69.8968 70.4252 69.6628C77.4916 68.657 84.5558 67.6511 91.62 66.6234C91.565 66.2013 91.4902 65.7837 91.3868 65.3748C85.1498 66.1882 78.926 67.135 72.6978 68.0272Z" fill="white"/>
                        <path d="M96.6449 31.6958C99.0099 29.1352 102.708 27.8866 106.153 28.4748C108.943 28.9143 111.539 30.4953 113.158 32.8022C114.92 35.2207 115.534 38.3957 114.881 41.304C114.021 45.3362 110.586 48.6402 106.519 49.4165C106.989 52.7687 107.487 56.1165 107.968 59.4664C111.906 60.3564 115.858 61.1917 119.802 62.0598C120.451 62.1189 120.942 62.7771 120.72 63.409C120.161 66.0724 119.536 68.7204 118.975 71.3838C121.446 71.3903 123.918 71.3663 126.389 71.3903C127.555 71.4034 128.556 72.5121 128.486 73.6645C128.483 76.7345 128.49 79.8046 128.483 82.8747C128.503 83.9833 127.518 85.0373 126.387 85.0133C124.383 85.0526 122.376 84.9892 120.372 85.0395C118.363 106.416 116.414 127.795 114.403 149.172C92.5111 149.168 103.617 149.17 114.722 149.17C116.084 149.207 114.453 149.094 115.81 149.22C116.532 149.441 116.206 150.572 115.465 150.441C79.0303 150.48 108.568 150.508 72.1245 150.451C67.1371 150.517 62.1497 150.421 57.1623 150.471C55.5519 150.432 55.9349 150.552 54.3289 150.397C53.6601 150.456 53.5369 149.378 54.1507 149.216C54.7887 149.122 55.4377 149.177 56.0823 149.168C67.0383 149.17 45.9943 149.17 56.9503 149.17C55.8965 138.523 54.9725 127.863 53.9539 117.212C52.9859 106.513 51.9387 95.8176 50.9927 85.116C48.9159 84.8864 46.8193 85.116 44.7381 84.9958C43.6975 84.9105 42.8395 83.9221 42.8527 82.8944C42.8351 79.8243 42.8505 76.752 42.8461 73.6798C42.7691 72.5121 43.7899 71.3947 44.9713 71.3903C46.5179 71.3575 48.0645 71.4078 49.6133 71.3707C49.4835 70.5266 49.2239 69.711 49.1095 68.8669C49.1205 68.3465 49.5539 67.9376 50.0555 67.8676C53.0431 67.2072 56.0285 66.5447 59.0161 65.9018C58.2395 60.153 57.3639 54.4196 56.5565 48.6752C56.4377 47.689 56.1825 46.705 56.2485 45.7079C56.2837 45.2269 56.7809 44.9841 57.2099 44.9404C69.3913 43.1976 81.5771 41.4942 93.7563 39.7318C93.5737 36.8082 94.5901 33.8146 96.6449 31.6958ZM102.275 29.8808C100.132 30.3881 98.1673 31.6608 96.8759 33.4407C95.2083 35.6624 94.6099 38.6516 95.3513 41.328C96.0223 43.9214 97.8813 46.1693 100.295 47.3501C104.213 49.3662 109.442 48.0958 111.99 44.5206C113.457 42.5657 114.12 40.0204 113.737 37.6063C113.325 34.6674 111.383 32.0041 108.727 30.6615C106.763 29.6469 104.426 29.3538 102.275 29.8808ZM57.5333 46.1977C58.6993 54.5989 59.9159 62.9957 61.1611 71.386C67.5763 71.375 73.9915 71.3838 80.4045 71.3772C80.6993 71.3619 81.0117 71.3947 81.2933 71.281C83.3283 71.5062 85.3853 71.3269 87.4291 71.3838C88.4169 71.3378 89.4157 71.4865 90.3947 71.3313C90.8039 71.3597 91.2153 71.3838 91.6289 71.3881C97.1993 71.3553 102.772 71.3947 108.342 71.3641C107.374 64.2596 106.301 57.1704 105.302 50.0703C105.379 49.4821 104.767 49.563 104.374 49.5652C102.407 49.633 100.453 49.0207 98.7899 48.0017C96.2533 46.4798 94.5439 43.8449 93.8949 41C81.7817 42.7844 69.6509 44.4418 57.5333 46.1977ZM108.16 60.8462C108.547 63.7064 109.035 66.5534 109.385 69.4179C109.462 70.0871 109.546 70.7606 109.79 71.3969C112.124 71.3094 114.461 71.4494 116.797 71.3335C117.074 71.3663 117.356 71.3903 117.64 71.4013C118.201 68.7029 118.814 66.0177 119.439 63.3325C115.695 62.4381 111.92 61.675 108.16 60.8462ZM50.4933 69.0921C50.6231 69.875 50.7595 70.66 51.0345 71.4078C53.9605 71.3488 56.8865 71.3969 59.8103 71.3597C59.6739 69.969 59.3593 68.6001 59.2581 67.205C56.3211 67.7626 53.4171 68.4711 50.4933 69.0921ZM44.1419 73.6863C44.1199 76.6755 44.1485 79.6669 44.1507 82.6582C44.0825 83.1546 44.4521 83.7056 44.9911 83.6838C48.4319 83.9986 51.8771 83.581 55.3223 83.7297C57.0097 83.8456 58.6971 83.6291 60.3845 83.7734C62.2149 83.8718 64.0387 83.5963 65.8691 83.6947C74.7483 83.6947 83.6319 83.6728 92.5111 83.6553C94.3723 83.7122 96.2379 83.5416 98.0947 83.7144C99.5951 83.8696 101.104 83.7341 102.609 83.7756C108.917 83.8412 115.224 83.6532 121.527 83.7756C123.069 83.5876 124.62 83.8172 126.165 83.7078C126.939 83.7297 127.326 82.8681 127.243 82.2034C127.086 80.4759 127.271 78.7441 127.188 77.0166C127.146 75.9058 127.203 74.795 127.199 73.6863C127.251 73.1244 126.73 72.5996 126.16 72.6805C112.003 72.6805 97.8439 72.6739 83.6869 72.6761C70.8565 72.6892 58.0261 72.628 45.1957 72.6717C44.6171 72.5974 44.0803 73.1025 44.1419 73.6863ZM52.2885 85.1029C53.9627 103.582 55.7403 122.055 57.4035 140.535C58.7059 140.73 60.0237 140.594 61.3349 140.601C63.8055 140.679 66.2783 140.607 68.7489 140.638C71.4593 140.478 74.1697 140.675 76.8779 140.57C78.7853 140.631 80.6927 140.574 82.6023 140.616C84.1445 140.705 85.6823 140.456 87.2245 140.605C89.2749 140.469 91.3231 140.708 93.3691 140.537C94.8387 140.55 96.3083 140.616 97.7779 140.557C99.0033 140.48 100.227 140.723 101.452 140.583C104.041 140.714 106.633 140.539 109.225 140.587C110.793 140.721 112.366 140.517 113.937 140.616C113.948 140.084 113.959 139.553 113.963 139.026C114.157 138.46 114.115 137.852 114.117 137.266C114.542 135.197 114.604 133.067 114.802 130.968C114.804 129.726 115.037 128.502 115.136 127.268C116.452 113.215 117.758 99.161 119.056 85.1051C102.724 85.0985 86.3907 85.1029 70.0601 85.1029C66.6875 84.9848 63.3105 84.9936 59.9401 85.1051C57.3903 85.1007 54.8383 85.1007 52.2885 85.1029ZM57.5663 141.954C57.6763 143.913 58.0195 145.853 58.0877 147.814C58.1295 148.245 58.1097 148.739 58.4177 149.087C59.3571 149.238 60.3075 149.034 61.2535 149.087C61.6187 149.163 61.9949 149.135 62.3667 149.133C64.5359 149.056 66.7117 149.168 68.8787 149.094C69.5607 149.144 70.2449 149.174 70.9291 149.142C74.0135 148.997 77.1023 149.225 80.1889 149.065C82.6309 149.111 85.0729 149.1 87.5171 149.085C89.0175 149.133 90.5245 149.144 92.0271 149.102L92.1547 149.067C94.1765 149.157 96.2049 149.188 98.2289 149.126C103.135 149.076 108.043 149.15 112.947 149.048C113.35 147.359 113.427 145.612 113.592 143.891C113.658 143.214 113.825 142.534 113.697 141.853C111.334 141.926 108.967 141.777 106.607 141.934C105.823 141.963 105.042 141.974 104.261 141.939C103.793 141.893 103.322 141.871 102.856 141.862C102.521 141.873 102.193 141.882 101.863 141.888C101.104 141.843 100.343 141.853 99.5841 141.873C97.8813 142.057 96.1741 141.762 94.4735 141.943C93.6001 142.059 92.7267 141.873 91.8555 141.941C91.8467 141.93 91.8291 141.913 91.8203 141.902C90.3617 141.965 88.9053 141.812 87.4489 141.928C84.2919 142.033 81.1349 141.766 77.9779 141.932C74.9595 141.886 71.9367 141.803 68.9205 141.956C68.2077 141.797 67.4685 141.906 66.7447 141.884C64.8879 141.915 63.0267 141.814 61.1721 141.945C59.9687 141.86 58.7675 141.917 57.5663 141.954Z" fill="#BCBCBC"/>
                        <path d="M52.513 51.4479C52.9156 51.3014 53.3886 51.6053 53.3842 52.0405C53.6174 54.6076 53.8792 57.1748 54.108 59.7419C54.328 60.6712 52.744 60.774 52.8188 59.825C52.579 57.3716 52.359 54.9116 52.1148 52.4581C52.0818 52.0908 52.0444 51.5485 52.513 51.4479Z" fill="#BCBCBC"/>
                        <path d="M42.8615 56.2674C42.9385 55.7317 43.7129 55.6639 44.0099 56.0575C45.8755 57.8549 47.7587 59.6414 49.5825 61.4804C50.0071 61.9068 49.5979 62.4732 49.1689 62.6962C48.3681 62.2108 47.7587 61.4936 47.0855 60.8572C45.8315 59.6327 44.5797 58.4082 43.3213 57.1902C43.0837 56.9387 42.7383 56.6566 42.8615 56.2674Z" fill="#BCBCBC"/>
                        <path opacity="0.4" d="M139.034 60.9473C138.84 60.3306 139.526 59.7962 140.079 60.0865C140.599 60.4797 141.024 60.9807 141.49 61.4355C142.01 60.9601 142.425 60.3101 143.078 60.0146C143.703 59.8964 143.967 60.5208 144 61.0372C143.513 61.5177 143.035 62.0111 142.553 62.4967C143.014 62.9772 143.526 63.4166 143.926 63.9562C144.161 64.5446 143.511 65.2075 142.924 64.9377C142.384 64.5523 141.956 64.0384 141.488 63.5759C141.019 64.0256 140.591 64.5215 140.071 64.9146C139.457 65.2538 138.745 64.5138 139.091 63.9022C139.472 63.3832 139.966 62.9592 140.415 62.4993C139.956 61.9854 139.336 61.5768 139.034 60.9473Z" fill="#ED4C67"/>
                        <path d="M68.6366 96.2068C68.938 96.2133 69.2394 96.2374 69.543 96.2636C69.6552 100.617 69.5628 104.978 69.5892 109.333C69.6948 113.49 69.5012 117.649 69.631 121.806C69.6728 122.705 69.6398 123.604 69.5298 124.496C69.2746 124.577 69.0216 124.658 68.7708 124.745C68.5552 124.459 68.3044 124.159 68.3506 123.776C68.344 114.951 68.3638 106.123 68.3418 97.2979C68.3616 96.9175 68.3066 96.4779 68.6366 96.2068Z" fill="#ED4C67"/>
                        <path d="M85.306 96.2615C85.856 95.8198 86.461 96.5108 86.3114 97.0837C86.3048 106.053 86.3312 115.023 86.2982 123.991C86.406 124.633 85.5722 124.918 85.141 124.504C85.0046 123.98 85.064 123.431 85.053 122.897C85.0772 114.293 85.042 105.686 85.0552 97.0837C85.0948 96.8082 84.9716 96.3971 85.306 96.2615Z" fill="#ED4C67"/>
                        <path d="M102.015 96.2373C102.437 95.9115 103.093 96.3445 102.981 96.8605C102.99 105.902 102.998 114.946 102.981 123.991C103.053 124.408 102.594 124.867 102.178 124.695C101.626 124.601 101.729 123.94 101.681 123.531C101.678 114.793 101.696 106.053 101.681 97.3154C101.707 96.9524 101.634 96.4451 102.015 96.2373Z" fill="#ED4C67"/>
                        <path d="M31.7986 110.12C32.7811 109.733 34.1409 110.341 33.9882 111.093C33.9313 111.834 32.4516 112.288 31.589 111.792C30.7053 111.393 30.8491 110.425 31.7986 110.12Z" fill="#BCBCBC"/>
                        <path d="M128.128 135.006C127.657 134.492 128.591 133.707 129.195 134.118C130.02 134.67 130.691 135.366 131.457 135.976C132.285 135.385 132.954 134.647 133.82 134.095C134.44 133.727 135.349 134.51 134.862 135.017C134.218 135.745 133.303 136.268 132.678 137.014C133.414 137.663 134.256 138.233 134.905 138.95C135.254 139.466 134.553 139.838 134.077 140C133.178 139.363 132.377 138.64 131.563 137.93C130.615 138.528 129.96 139.411 128.935 139.918C128.347 139.945 127.787 139.427 128.093 138.943C128.732 138.185 129.652 137.64 130.329 136.905C129.603 136.263 128.789 135.695 128.128 135.006Z" fill="#BCBCBC"/>
                        <path opacity="0.4" d="M34.1016 143.013C33.7241 142.455 34.4886 141.722 35.027 142.124C35.7379 142.699 36.3206 143.416 36.9965 144.032C37.712 143.383 38.3157 142.601 39.1012 142.031C39.6746 141.845 40.2433 142.529 39.889 143.032C39.304 143.741 38.5884 144.33 37.9638 145.007C38.5884 145.679 39.3063 146.263 39.8843 146.975C40.2922 147.51 39.5324 148.281 38.9847 147.897C38.2644 147.313 37.6747 146.591 36.9942 145.968C36.3136 146.596 35.7239 147.322 34.999 147.901C34.4513 148.25 33.738 147.55 34.097 146.996C34.6704 146.27 35.3999 145.684 36.0269 145.005C35.4022 144.323 34.6727 143.739 34.1016 143.013Z" fill="#ED4C67"/>
                        <g opacity="0.5">
                            <path opacity="0.3" d="M73.9646 23.1507C75.4219 22.6685 77.2357 23.3696 77.7484 24.8814C78.6566 26.7606 76.9651 29.096 74.9352 28.997C73.3062 29.0308 71.9347 27.5139 72.0024 25.9083C71.9816 24.6885 72.8508 23.5729 73.9646 23.1507Z" fill="#ED4C67"/>
                            <path d="M70.7333 49.5958C71.9653 49.4493 73.1863 49.1541 74.4359 49.1804C74.4161 49.6133 74.6845 50.442 73.9915 50.4442C70.2713 50.9384 66.5643 51.5376 62.8397 51.9989C62.7891 51.5879 62.7627 51.1724 62.7605 50.7591C65.4071 50.3108 68.0779 50.0025 70.7333 49.5958Z" fill="#EDEDED"/>
                            <path d="M81.0447 57.9729C84.1005 57.5837 87.1343 57.0151 90.1989 56.7134C90.2319 57.1135 90.2627 57.5159 90.2957 57.916C84.8859 58.7623 79.4585 59.4992 74.0421 60.3083C70.8059 60.7172 67.5961 61.3404 64.3489 61.6509C64.2741 61.2485 64.2015 60.8484 64.1355 60.4482C69.7653 59.5779 75.4105 58.8148 81.0447 57.9729Z" fill="#EDEDED"/>
                            <path d="M88.0716 61.3863C89 61.2551 89.9262 61.0671 90.87 61.0933C90.892 61.4825 90.9162 61.8696 90.9382 62.2588C82.6728 63.5271 74.3788 64.6423 66.1068 65.8755C65.702 65.9433 65.2928 65.9477 64.8836 65.9477C64.8572 65.5563 64.8308 65.1649 64.8088 64.7735C72.5528 63.5883 80.321 62.5409 88.0716 61.3863Z" fill="#EDEDED"/>
                            <path d="M72.698 68.0272C78.9262 67.135 85.15 66.1882 91.387 65.3748C91.4904 65.7837 91.5652 66.2013 91.6202 66.6233C84.556 67.6511 77.4918 68.6569 70.4254 69.6628C68.7996 69.8968 67.1826 70.2029 65.5414 70.3057C65.4886 69.9077 65.449 69.5097 65.4226 69.1118C67.8316 68.6482 70.278 68.4164 72.698 68.0272Z" fill="#EDEDED"/>
                            <path d="M100.721 68.3355C101.529 68.1125 102.371 68.0993 103.203 68.1343C103.216 68.5804 103.229 69.0287 103.243 69.4748C101.936 69.7175 100.592 69.6081 99.2958 69.9186C97.9846 70.2226 96.6492 70.4019 95.3072 70.4959C95.2786 70.649 95.25 70.8042 95.2258 70.9595C93.6308 70.5878 91.9522 70.9267 90.3946 71.3312C89.4156 71.4865 88.4168 71.3378 87.429 71.3837C85.3852 71.3269 83.3282 71.5062 81.2932 71.2809C81.9466 70.9267 82.7188 71.0032 83.4272 70.8524C84.6526 70.6118 85.9066 70.5637 87.1276 70.2882C87.7084 70.157 88.3002 70.0783 88.8942 70.0477C89.9568 69.9886 90.9798 69.63 92.049 69.6191C93.3272 69.5863 94.5614 69.243 95.8044 68.9806C97.4478 68.8078 99.1154 68.7575 100.721 68.3355Z" fill="#EDEDED"/>
                            <path opacity="0.3" d="M20.3552 78.0034C22.1882 77.9182 23.9552 79.4288 23.9821 81.2975C24.2164 83.4221 22.1149 85.3372 20.0184 84.9498C18.1659 84.7597 16.7064 82.8885 17.0505 81.0466C17.1823 79.3654 18.7102 78.0838 20.3552 78.0034ZM20.3577 79.4483C19.6255 79.5262 18.9738 80.0233 18.6321 80.6641C18.1855 81.5923 18.576 82.8106 19.5107 83.2686C20.653 84.0288 22.4274 83.1444 22.5274 81.7873C22.7495 80.5617 21.5731 79.3581 20.3577 79.4483Z" fill="#ED4C67"/>
                            <path opacity="0.3" d="M150.038 106.044C152.143 105.676 154.213 107.673 153.982 109.792C153.854 111.48 152.407 112.965 150.691 112.982C148.471 113.231 146.488 110.842 147.119 108.694C147.388 107.279 148.67 106.275 150.038 106.044ZM150.031 107.51C148.568 107.846 147.908 109.923 149.039 110.973C150.06 112.047 152 111.543 152.463 110.162C152.999 108.716 151.521 107.086 150.031 107.51Z" fill="#ED4C67"/>
                        </g>
                        <path d="M107.093 34.8292C107.574 34.3525 108.391 35.0632 108.032 35.6361C107.189 36.7579 106.23 37.79 105.361 38.8942C106.426 39.7733 107.517 40.6261 108.556 41.5357C109.09 42.0277 108.428 42.9111 107.792 42.535C106.666 41.7063 105.627 40.7616 104.541 39.8848C103.592 40.9475 102.752 42.1021 101.775 43.1342C101.285 43.4753 100.605 42.9855 100.781 42.4082C101.617 41.2318 102.646 40.2019 103.504 39.0364C102.455 38.1508 101.362 37.3133 100.33 36.408C99.7623 35.986 100.462 35.0042 101.049 35.3846C102.209 36.2024 103.236 37.1952 104.371 38.048C105.275 36.9743 106.129 35.8526 107.093 34.8292Z" fill="#ED4C67"/>
                        <path d="M108.16 60.8462C111.919 61.6749 115.695 62.4381 119.439 63.3324C118.814 66.0177 118.2 68.7029 117.639 71.4012C117.356 71.3903 117.074 71.3662 116.797 71.3334C116.174 70.8283 115.626 70.2401 115.09 69.6497C114.79 70.0083 114.491 70.3669 114.19 70.7234C114.256 70.4697 114.326 70.2204 114.394 69.9712C113.547 70.1155 112.747 70.426 111.946 70.7234C111.145 70.6293 110.982 69.8115 110.921 69.1533C110.426 69.3217 109.911 69.4201 109.385 69.4179C109.035 66.5534 108.547 63.7064 108.16 60.8462Z" fill="#FCFCFC"/>
                        <path d="M50.4932 69.0922C53.417 68.4712 56.321 67.7627 59.258 67.2051C59.3592 68.6002 59.6738 69.969 59.8102 71.3597C56.8864 71.3969 53.9604 71.3488 51.0344 71.4079C50.7594 70.66 50.623 69.875 50.4932 69.0922Z" fill="#FAFAFA"/>
                        <path d="M109.385 69.4179C109.911 69.4201 110.426 69.3217 110.921 69.1533C110.982 69.8115 111.145 70.6293 111.946 70.7233C112.747 70.426 113.547 70.1154 114.394 69.9711C114.326 70.2204 114.256 70.4697 114.19 70.7233C114.491 70.3669 114.79 70.0083 115.09 69.6497C115.626 70.2401 116.174 70.8283 116.797 71.3334C114.46 71.4493 112.124 71.3094 109.79 71.3968C109.546 70.7605 109.462 70.087 109.385 69.4179Z" fill="#F1F1F1"/>
                    </svg>
                    <p>
                        شما در حال حذف کردن یک آیتم از منو به زبان {itemLang} هستید
                        <br/>
                        آیا از این کار مطمئنید؟
                    </p>
                </Modal>
                {editModal&&<EditMenuLang closeModal={closeModal} getData={getData} editRecord={editRecord} />}
            </div>
        )
    )
}

export default AddLang

