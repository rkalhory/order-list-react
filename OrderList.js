import React, {useEffect, useState} from "react";
import SortableTree  from "react-sortable-tree-patch-react-17";
import 'react-sortable-tree-patch-react-17/style.css';
import {createTreeOrder} from "../../../utils/funcTree";
import {message, Spin} from "antd";
import {Button} from "../../../components/utils/field";
import axios from "../../../services/Axios";
import MainTopTitle from "../../../components/utils/mainTopTitle";
import {useHistory} from "react-router-dom";
import './style.css'

function OrderList({data,dataType,langId}) {

    const [treeData,setTreeData]=useState([])
    const [loading,setLoading]=useState(true)
    // const [height,setHeight]=useState(600)

    // console.log('data OrderList',data)

    useEffect(()=>{
        const convert = data?.map((p) => createTreeOrder(p));
        setTreeData(convert)
        setLoading(false)
    },[data])

    const history=useHistory()

    function reorder(array) {
        setLoading(true)
        for(let i=0;i<array.length;i++){
            array[i].priority=i+1
            if(array[i]?.children?.length){
                reorder(array[i].children)
            }
        }
        setTreeData(array)
    }

    function createMainArrey(array) {
        let temp=[]
        function nested(a,p) {
            for(let j=0;j<a.length;j++){
                let t={
                    Id: a[j].id,
                    Priority:a[j].priority,
                }
                if(p)t.ParentId=p
                temp.push(t)
                if(a[j]?.children?.length)nested(a[j]?.children,a[j].id)
            }

        }
        nested(array,null)
        return temp
    }

    useEffect(()=>{
        treeData.length&&setLoading(false)
        // if(document.querySelector('.ReactVirtualized__Grid__innerScrollContainer')){
        //     setHeight(document.querySelector('.ReactVirtualized__Grid__innerScrollContainer').style.height)
        // }
    },[treeData])

    // useEffect(()=>{
    //     setLoading(false)
    // },[height])

    function saveOrder() {
        setLoading(true)
        let mainArray=createMainArrey(treeData)
        let error=false
        let errorMsg=''
        let url
        if(langId===1){
            url='Menu/ChangeOrderBaseMenu'
        }else{
            url='Menu/ChangeOrderMenu'
        }
        axios.put(url, mainArray)
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
                    dataType()
                }else{
                    !errorMsg?
                        message.error('مشکلی وجود دارد! دوباره تلاش کنید.'):
                        message.error(errorMsg)
                }
                setLoading(false)
            })
    }



    return (
        <>
        <div className='content-box position-relative mt-30'>
            {loading&&<div style={{position:"absolute",inset:0,background:'rgba(255, 255, 255,.5)',display:"flex",alignItems:"center",justifyContent:'center'}}><Spin/></div>}
            <div className='content'>
                <div className='position-relative' >
                    <MainTopTitle
                        title={'ساختار منوها'}
                        icon={''}
                    />
                    {!treeData.length?<div className="ant-empty ant-empty-normal ant-empty-rtl">
                            <div className="ant-empty-image">
                                <svg className="ant-empty-img-simple" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                        <ellipse className="ant-empty-img-simple-ellipse" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                        <g className="ant-empty-img-simple-g" fillRule="nonzero">
                                            <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                            <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                                  className="ant-empty-img-simple-path"></path>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <div className="ant-empty-description">داده&zwnj;ای موجود نیست</div>
                        </div>:<div className='position-relative'>
                        <div style={{height:600}}>
                            <SortableTree
                                lineColor={'green'}
                                lineBorderRadius={'10px'}
                                rowDirection={"rtl"}
                                treeData={treeData}
                                maxDepth={3}
                                onChange={treeData => reorder(treeData)}
                                generateNodeProps={({ node, path }) => ({
                                    title: (
                                        <div style={{display:"flex",alignItems:'center',justifyContent:"space-between",width:'100%'}}>
                                            <div>{node.title}</div>
                                        </div>
                                    )

                                })}
                            />
                        </div>
                    </div>}
                </div>
            </div>
        </div>
            <div className='d-flex justify-content-end'>
                <div className='d-flex justify-content-end action-btn-block mt-10 justify-content-between'>
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
                        type="button"
                        htmlType="button"
                        loading={loading}
                        disabled={loading}
                        onClick={()=>saveOrder()}
                    />
                </div>
            </div>
            </>
    );
}

export default OrderList
