import { FC, useEffect, useState } from "react";
import { ArrowIcon } from "@/components/images/";
import  s from './pagination.module.scss'
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination: FC<{ total: number, limit: number }> = ({ total, limit }) => {

  const router = useRouter();
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const pathname = usePathname()

  const itemsCount = limit || 10

  let currentPage = page && +page || 1

  const setSearchParam = (name: string, value: string | number) => {

    const params = new URLSearchParams(searchParams.toString())
    params.set(name, String( value ))

    router.push(pathname + '?' + params.toString())

  }

  const setCurrentPage = ( pageNumber: number | string ) => {

    setSearchParam('page', pageNumber)

  }

  const [ pageItem, SetPageItem ] = useState({

    start: 0,
    end: itemsCount

  })

  

  const onPageChangeEvent = ( start: number , end: number  ) => {

    SetPageItem({

      start: start,
      end: end
      
    })

  }

  const numOfPages = Math.ceil( total / itemsCount );

  const numOfButtons: number[] = [];

  for ( let i = 1; i <= numOfPages; i++ ) {

    numOfButtons.push( i );

  }

  const prevPageClick = () => {

    if ( currentPage === 1 ) {

      setCurrentPage( currentPage );

    } else {

      setCurrentPage( currentPage - 1 );

    }

  }

  const nextPageClick = () => {
  
    if (currentPage === numOfButtons.length) {

      setCurrentPage(currentPage);

    } else {

      setCurrentPage(currentPage + 1);

    }

  }

  const [ arrOfCurrButtons, setArrOfCurrButtons ] = useState< Array< string | number >>([]);   

  useEffect(() => {

    let tempNumberOfButtons: Array< number | string > = [...arrOfCurrButtons]

    let dotsInitial = '...'
    let dotsLeft = '... '
    let dotsRight = ' ...'

    if (numOfButtons.length < 6) {
      tempNumberOfButtons = numOfButtons
    }

    else if (currentPage >= 1 && currentPage <= 3) {
      tempNumberOfButtons = [1, 2, 3, 4, dotsInitial, numOfButtons.length]
    }

    else if (currentPage === 4) {
      const sliced = numOfButtons.slice(0, 5)
      tempNumberOfButtons = [...sliced, dotsInitial, numOfButtons.length]
    }

    else if (currentPage > 4 && currentPage < numOfButtons.length - 2) {
      // from 5 to 8 -> (10 - 2)
      const sliced1 = numOfButtons.slice(currentPage - 2, currentPage)
      // sliced1 (5-2, 5) -> [4,5] 
      const sliced2 = numOfButtons.slice(currentPage, currentPage + 1)
      // sliced1 (5, 5+1) -> [6]
      tempNumberOfButtons = ([1, dotsLeft, ...sliced1, ...sliced2, dotsRight, numOfButtons.length])
      // [1, '...', 4, 5, 6, '...', 10]
    }

    else if (currentPage > numOfButtons.length - 3) {
      // > 7
      const sliced = numOfButtons.slice(numOfButtons.length - 4)
      // slice(10-4) 
      tempNumberOfButtons = ([1, dotsLeft, ...sliced])
    }

    else if (+currentPage === +dotsInitial) {

      // [1, 2, 3, 4, "...", 10].length = 6 - 3  = 3 
      // arrOfCurrButtons[3] = 4 + 1 = 5
      // or 
      // [1, 2, 3, 4, 5, "...", 10].length = 7 - 3 = 4
      // [1, 2, 3, 4, 5, "...", 10][4] = 5 + 1 = 6
      setCurrentPage(+arrOfCurrButtons[arrOfCurrButtons.length - 3] + 1)

    }

    else if (+currentPage === +dotsRight) {
      setCurrentPage(+arrOfCurrButtons[3] + 2)
    }

    else if (+currentPage === +dotsLeft) {
      setCurrentPage(+arrOfCurrButtons[3] - 2)
    }

    setArrOfCurrButtons(tempNumberOfButtons);
    const value = currentPage * itemsCount;

    onPageChangeEvent(value - itemsCount, value)

  }, [ currentPage, itemsCount, numOfPages ]);

  return (

    <div className = { s.pagination }>

      <ul className = { s.pagination_ul }>
 
        <li className = {`${ s.pagination_item } ${currentPage === 1 ? s.disabled : ''}`}>

          <a className = { s.pagination_link } onClick = { prevPageClick }>

            <ArrowIcon className = {`${ s.arrow } ${ s.arrow_prev }`}/>

          </a>
        
        </li>

        {

          arrOfCurrButtons.map((data, index) => {

            return (

              <li key = { index } className = {`${ s.pagination_item } ${ currentPage === data ? s.active : ''  }`}>

                <a className = { s.pagination_link } onClick = { () => setCurrentPage( data ) }>

                  <span>{ data }</span>

                </a>

              </li>

            )

          })

        }

        <li className={`${ s.pagination_item } ${currentPage === numOfButtons.length ? s.disabled : ''}`}>

          <a className = { s.pagination_link } onClick = { nextPageClick }>

            <ArrowIcon className = {`${ s.arrow } ${ s.arrow_next }`}/>

          </a>

        </li>

      </ul>

    </div>

  );

}

export default Pagination;