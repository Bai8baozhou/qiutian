import { useEffect, useMemo, useState } from "react"

export default function App() {
  //#region 输入框相关
  const [input, setInput] = useState('')
  const vaildInput = (v: string) => {
    /**
     * 合法值
     * 空字符串，清空输入框内容
     * 不以 0 开头的数字
     */
    const a = v == ''
    const b = /^[1-9]\d*$/.test(v)
    return [a, b].some(Boolean)
  }
  const updateInput = (e:React.ChangeEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value
    vaildInput(v) && setInput(v)
  }
  //#endregion

  //#region 请求相关
  // 优化 => 输入过程中，不需要更新状态
  const uin = useMemo(() => input.length < 5 ? '' : input, [input])
  const debounced = useDebounce(uin, 100)
  const [isSearching, setIsSearching] = useState(false)
  const [isErorr, setIsErorr] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo|null>(null)
  useEffect(() => {
    const qq = debounced
    // 重置报错
    setIsErorr(false)
    // 清空当前用户信息
    if (debounced.length < 5) {
      return setUserInfo(null)
    }
    // 发送请求逻辑
    setIsSearching(true)
    fetchUserApi(qq)
      .then(result => {
        if (result.code != 1) {
          throw result
        }
        setUserInfo(result)
      })
      .catch(error => {
        setIsErorr(true)
        console.error(error)
      })
      .finally(() => setIsSearching(false))    
  }, [debounced])
  //#endregion

  return (
    <div className="demo">
      <h3>查询QQ号</h3>
      <div className="head">
        <input
          type="text" maxLength={11}
          value={input}
          onChange={updateInput}
        />
      </div>
      <ResultCard
        isSearching={isSearching}
        isErorr={isErorr}
        userInfo={userInfo}
      />
    </div>
  )
}

type ResultCardProps = {
  isSearching: boolean
  isErorr: boolean
  userInfo: UserInfo|null
}

// React.memo
function ResultCard({isSearching, isErorr, userInfo}:ResultCardProps) {
  if (isSearching) return <h4 className='flex'>搜索中......</h4>
  if (isErorr) return <h4 className='flex'>出错了......</h4>
  if (userInfo == null) return <h4 className='flex'>请输入QQ号进行搜索</h4>

  return <div className='flex'>
    <img className='avatar' src={userInfo.qlogo} alt="头像" />
    <span>QQ昵称:{userInfo.name || '""'}</span>
    <span>QQ号:{userInfo.qq}</span>
  </div>
}

type UserInfo = {
  name: string
  qlogo: string
  qq: string
}

function fetchUserApi(qq: string) {
  const url = `https://api.uomg.com/api/qq.info?qq=${qq}`
  return fetch(url).then(r => r.json())
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(value)
    }, delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}