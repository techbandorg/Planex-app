import React, { useEffect, useState } from 'react';

import { SolidButton } from '../../../theme';
import {
  Title,
  Wrapper,
  Text,
  Tag,
  TitleContainer,
  Content,
  InputError
} from './styles';
import { useWeb3React } from '@web3-react/core';
import { checkApprove, convertToUSD, formatToHuman, getUserAvailableAmount } from '../../../utils/blockchainUtils';
import ModalBackdrop from '../../ModalBackdrop/ModalBackdrop';
import StatusModal from '../../StatusModal/StatusModal';
import InputContainer from './InputContainer/InputContainer';
import Loader from '../../Loader/Loader';
import useDebounce from '../../../hooks/useDebounce';

const PreSaleContent = () => {
  const { chainId, account } = useWeb3React();
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [isTransErrorModal, setIsTransErrorModal] = useState(false)
  const [isTransSuccessModal, setIsTransSuccessModal] = useState(false)
  const [isTransLoading, setIsTransLoading] = useState(false)
  const [isInputAmountError, setIsInputAmountError] = useState(false)
  const [userAvailableAmount, setUserAvailableAmount] = useState('')
  const [convertedToUSDAmount, setConvertedToUSDAmount] = useState('')
  const debouncedValue = useDebounce<string>(tokenAmount, 300)

  useEffect(() => {
    if (tokenName === 'BNB' || tokenName === 'ETH') {
      convertToUSD(chainId, tokenAmount).then(res => setConvertedToUSDAmount(formatToHuman(chainId, res?.usdtAmount)))
    }
  }, [debouncedValue])

  useEffect(() => {
    if (chainId) getUserAvailableAmount(chainId, account)
      .then(res => setUserAvailableAmount(formatToHuman(chainId, res?.usdtAmount)))
  }, [chainId, isTransSuccessModal]);

  useEffect(() => {
    if (tokenName === 'BNB' || tokenName === 'ETH') {
      if (+convertedToUSDAmount === 0) {
        return setIsInputAmountError(false)
      }
      if (+convertedToUSDAmount <= 1000 && +convertedToUSDAmount >= 10) {
        setIsInputAmountError(false)
      }
    }
  }, [convertedToUSDAmount]);

  return (
    <>
      <Wrapper>
        <Content>
          <TitleContainer>
            <Title>Pre-Sale</Title>
            <Tag>Limited purchase restrictions 10-1000$</Tag>
          </TitleContainer>
          <Text>Stake your SEAN up to 35 days to earn extra SEAN.</Text>
          <InputContainer
            tokenAmount={tokenAmount}
            tokenName={tokenName}
            convertedToUSDAmount={convertedToUSDAmount}
            isInputAmountError={isInputAmountError}
            // @ts-ignore
            setTokenAmount={setTokenAmount}
            setTokenName={setTokenName}
            setIsInputAmountError={setIsInputAmountError}
          />
          {isInputAmountError &&
            <InputError>
              {+userAvailableAmount < 10
                ? <>You have reached the limit of buying tokens</>
                : <>Please, enter an amount from 10$ to {userAvailableAmount.replace(/(\.0+|0+)$/, '')}$</>
              }
            </InputError>
          }
          <SolidButton disabled={!tokenAmount || isTransLoading || isInputAmountError || +tokenAmount === 0 || +userAvailableAmount < 10} onClick={
            () => checkApprove(chainId, account, tokenAmount, tokenName, setIsTransSuccessModal, setIsTransErrorModal, setIsTransLoading)}
          >
            {isTransLoading
              ? <>
                <Loader stroke='#D4E5FF' size='20px' style={{marginRight: '10px'}}/>
                Pending
              </>
              : 'Buy Token'
            }
          </SolidButton>
        </Content>
      </Wrapper>

      {isTransErrorModal &&
        <ModalBackdrop setIsModalOpen={setIsTransErrorModal}>
          <StatusModal setIsModalOpen={setIsTransErrorModal} isError/>
        </ModalBackdrop>
      }

      {isTransSuccessModal &&
        <ModalBackdrop setIsModalOpen={setIsTransSuccessModal}>
          <StatusModal setIsModalOpen={setIsTransSuccessModal}/>
        </ModalBackdrop>
      }
    </>
  );
};

export default PreSaleContent;
